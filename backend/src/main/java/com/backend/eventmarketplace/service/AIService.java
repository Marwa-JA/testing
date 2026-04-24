package com.backend.eventmarketplace.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.logging.Logger;

@Service
public class AIService {

    private static final Logger logger = Logger.getLogger(AIService.class.getName());

    @Value("${openrouter.api.key}")
    private String apiKey;

    private static final String OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
    private static final String MODEL = "google/gemma-3n-e4b-it:free";

    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(30))
            .build();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public String chat(List<Map<String, String>> messages) throws Exception {
        // Gemma 3n doesn't support system role — merge system messages into the first user message
        List<Map<String, String>> converted = mergeSystemMessages(messages);

        ObjectNode body = objectMapper.createObjectNode();
        body.put("model", MODEL);

        ArrayNode messagesArray = body.putArray("messages");
        for (Map<String, String> msg : converted) {
            ObjectNode msgNode = messagesArray.addObject();
            msgNode.put("role", msg.get("role"));
            msgNode.put("content", msg.get("content"));
        }

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(OPENROUTER_URL))
                .header("Authorization", "Bearer " + apiKey)
                .header("Content-Type", "application/json")
                .timeout(Duration.ofSeconds(60))
                .POST(HttpRequest.BodyPublishers.ofString(objectMapper.writeValueAsString(body)))
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() != 200) {
            logger.severe("OpenRouter API error (status " + response.statusCode() + "): " + response.body());
            throw new RuntimeException("AI service unavailable. Please try again later.");
        }

        JsonNode responseJson = objectMapper.readTree(response.body());
        JsonNode choices = responseJson.path("choices");
        if (choices.isMissingNode() || !choices.isArray() || choices.isEmpty()) {
            logger.warning("OpenRouter returned no choices: " + response.body());
            throw new RuntimeException("AI returned an empty response. Please try again.");
        }
        return choices.get(0).path("message").path("content").asText();
    }

    private List<Map<String, String>> mergeSystemMessages(List<Map<String, String>> messages) {
        StringBuilder systemContent = new StringBuilder();
        List<Map<String, String>> nonSystem = new ArrayList<>();

        for (Map<String, String> msg : messages) {
            if ("system".equals(msg.get("role"))) {
                if (systemContent.length() > 0) systemContent.append("\n");
                systemContent.append(msg.get("content"));
            } else {
                nonSystem.add(msg);
            }
        }

        if (systemContent.length() == 0) return messages;

        List<Map<String, String>> result = new ArrayList<>();
        boolean prepended = false;
        for (Map<String, String> msg : nonSystem) {
            if (!prepended && "user".equals(msg.get("role"))) {
                result.add(Map.of("role", "user", "content",
                        "[Instructions: " + systemContent + "]\n\n" + msg.get("content")));
                prepended = true;
            } else {
                result.add(msg);
            }
        }
        if (!prepended) {
            result.add(0, Map.of("role", "user", "content", systemContent.toString()));
        }
        return result;
    }
}
