import { useState, useEffect, useRef } from "react";
import { Card } from "primereact/card";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Toast } from "primereact/toast";
import { Tag } from "primereact/tag";
import { Rating } from "primereact/rating";
import { useNavigate, useLocation } from "react-router-dom";
import { supplierService } from "../services/supplierService";
import { reviewService } from "../services/reviewService";

const serviceTypeOptions = [
  { label: "All Services", value: "" },
  { label: "Catering", value: "CATERING" },
  { label: "Decoration", value: "DECORATION" },
  { label: "Entertainment", value: "ENTERTAINMENT" },
  { label: "Photography", value: "PHOTOGRAPHY" },
  { label: "Venue", value: "VENUE" },
  { label: "Equipment", value: "EQUIPMENT" },
  { label: "Other", value: "OTHER" },
];

const serviceTypeLabels = {
  CATERING: "Catering",
  DECORATION: "Decoration",
  ENTERTAINMENT: "Entertainment",
  PHOTOGRAPHY: "Photography",
  VENUE: "Venue",
  EQUIPMENT: "Equipment",
  OTHER: "Other",
};

export const SupplierDirectoryPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const basePath = location.pathname.startsWith('/organizer') ? '/organizer/suppliers' : '/suppliers';
  const [suppliers, setSuppliers] = useState([]);
  const [ratings, setRatings] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [serviceTypeFilter, setServiceTypeFilter] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [cityOptions, setCityOptions] = useState([
    { label: "All Cities", value: "" },
  ]);
  const toast = useRef(null);

  useEffect(() => {
    loadSuppliers();
  }, []);

  const loadSuppliers = async () => {
    try {
      const suppliersData = await supplierService.getAllSuppliers();
      setSuppliers(suppliersData);

      const uniqueCities = [
        ...new Set(suppliersData.map((s) => s.city).filter(Boolean)),
      ];
      const cities = [
        { label: "All Cities", value: "" },
        ...uniqueCities.sort().map((city) => ({ label: city, value: city })),
      ];
      setCityOptions(cities);

      const ratingResults = await Promise.all(
        suppliersData.map((s) =>
          reviewService.getSupplierAverageRating(s.id).catch(() => null)
        )
      );
      const ratingMap = {};
      suppliersData.forEach((s, i) => {
        const raw = ratingResults[i];
        ratingMap[s.id] = raw != null
          ? (typeof raw === 'object' ? parseFloat(raw.average) : parseFloat(raw))
          : null;
      });
      setRatings(ratingMap);
    } catch (error) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to load Providers",
        life: 3000,
      });
    }
  };

  const filteredSuppliers = suppliers.filter((supplier) => {
    const userName = supplier?.name?.toLowerCase() || "";
    const description = supplier.description?.toLowerCase() || "";
    const city = supplier.city?.toLowerCase() || "";
    const term = searchTerm.toLowerCase();

    const matchesSearch =
      !searchTerm ||
      userName.includes(term) ||
      description.includes(term) ||
      city.includes(term);

    const matchesServiceType =
      !serviceTypeFilter || supplier.serviceType === serviceTypeFilter;
    const matchesCity = cityFilter === "" || supplier.city === cityFilter;

    return matchesSearch && matchesServiceType && matchesCity;
  });

  const handleContactSupplier = (supplier) => {
    if (supplier?.email) {
      window.location.href = `mailto:${supplier.email}`;
    }
  };

  const renderSupplierCard = (supplier) => {
    const header = (
      <div className="flex items-center gap-3 p-4 border-b">
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-gray-900 mb-1">
            {supplier?.name || "Unknown Provider"}
          </h3>
          <div className="flex items-center gap-2 mb-1">
            <i className="pi pi-briefcase text-sm text-gray-600"></i>
            <Tag
              value={serviceTypeLabels[supplier.serviceType]}
              severity="info"
            />
          </div>
          {supplier.city && (
            <div className="flex items-center gap-2">
              <i className="pi pi-map-marker text-sm text-gray-600"></i>
              <span className="text-sm text-gray-600">{supplier.city}</span>
            </div>
          )}
          {ratings[supplier.id] != null && (
            <div className="flex align-items-center gap-2 mt-1">
              <Rating value={Math.round(ratings[supplier.id])} readOnly cancel={false} />
              <span className="text-sm text-gray-500">({ratings[supplier.id].toFixed(1)})</span>
            </div>
          )}
        </div>
      </div>
    );

    return (
      <Card
        key={supplier.id}
        header={header}
        className="shadow-md hover:shadow-lg transition-shadow"
      >
        <div className="space-y-4">
          {supplier.description && (
            <p className="text-gray-700 text-sm line-clamp-3">
              {supplier.description}
            </p>
          )}

          <div className="space-y-2">
            {supplier?.email && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <i className="pi pi-envelope"></i>
                <a
                  href={`mailto:${supplier.email}`}
                  className="hover:text-blue-600 truncate"
                >
                  {supplier.email}
                </a>
              </div>
            )}
            {supplier?.phoneNumber && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <i className="pi pi-phone"></i>
                <a
                  href={`tel:${supplier.phoneNumber}`}
                  className="hover:text-blue-600"
                >
                  {supplier.phoneNumber}
                </a>
              </div>
            )}
          </div>

          <Button
            label="View Services"
            icon="pi pi-list"
            onClick={() => navigate(`${basePath}/${supplier.id}`)}
            className="w-full my-3"
            severity="primary"
          />
          <Button
            label="Contact Provider"
            icon="pi pi-send"
            onClick={() => handleContactSupplier(supplier)}
            disabled={!supplier?.email}
            className="w-full p-button-outlined"
          />
        </div>
      </Card>
    );
  };

  return (
    <div className="min-h-screen p-6">
      <Toast ref={toast} />

      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            <i className="pi pi-users mr-3"></i>
            Provider Directory
          </h1>
          <p className="text-gray-600">
            Find the perfect Providers for your event
          </p>
        </div>

        <Card className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <span className="p-input-icon-left w-full">
              <InputText
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search suppliers..."
                className="w-full"
              />
            </span>

            <Dropdown
              value={serviceTypeFilter}
              options={serviceTypeOptions}
              optionValue="value"
              onChange={(e) => setServiceTypeFilter(e.value)}
              placeholder="Select Service Type"
              className="w-full"
            />

            <Dropdown
              value={cityFilter}
              options={cityOptions}
              optionValue="value"
              onChange={(e) => setCityFilter(e.value)}
              placeholder="Select City"
              className="w-full"
            />
          </div>
        </Card>

        <div className="mb-4">
          <p className="text-gray-600">
            <i className="pi pi-filter mr-2"></i>
            Showing <strong>{filteredSuppliers.length}</strong> Provider
            {filteredSuppliers.length !== 1 ? "s" : ""}
          </p>
        </div>

        {filteredSuppliers.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <i className="pi pi-inbox text-6xl text-gray-400 mb-4"></i>
              <p className="text-gray-500 text-lg">
                No Providers found matching your criteria
              </p>
              <p className="text-gray-400 mt-2">Try adjusting your filters</p>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSuppliers.map(renderSupplierCard)}
          </div>
        )}
      </div>
    </div>
  );
};
