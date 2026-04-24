import { Calendar } from 'primereact/calendar';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';

export const EventFilters = ({ filters, onFilterChange, onSearch, onReset }) => {
  const eventTypeOptions = [
    { label: 'All Types', value: 'ALL' },
    { label: 'Public Events', value: 'PUBLIC_EVENT' },
    { label: 'Host Packages', value: 'HOST_PACKAGE' }
  ];

  const cityOptions = [
    { label: 'Damascus', value: 'Damascus' }  
  ];

  return (
    <Card className="mb-4">
      <div className="grid">
        <div className="col-12 md:col-4">
          <label className="block text-900 font-medium mb-2">Search</label>
          <InputText 
            value={filters.searchTerm}
            onChange={(e) => onFilterChange('searchTerm', e.target.value)}
            placeholder="Search events..."
            className="w-full"
          />
        </div>

        <div className="col-12 md:col-4">
          <label className="block text-900 font-medium mb-2">City</label>
          <Dropdown 
            value={filters.city}
            options={cityOptions}
            onChange={(e) => onFilterChange('city', e.value)}
            className="w-full"
          />
        </div>
        
        <div className="col-12 md:col-4">
          <label className="block text-900 font-medium mb-2">Event Type</label>
          <Dropdown 
            value={filters.eventType}
            options={eventTypeOptions}
            onChange={(e) => onFilterChange('eventType', e.value)}
            className="w-full"
          />
        </div>
        
        <div className="col-12 md:col-4">
          <label className="block text-900 font-medium mb-2">Start Date</label>
          <Calendar 
            value={filters.startDate}
            onChange={(e) => onFilterChange('startDate', e.value)}
            showIcon
            className="w-full"
            placeholder="From date"
            dateFormat="yy-mm-dd"
          />
        </div>
        
        <div className="col-12 md:col-4">
          <label className="block text-900 font-medium mb-2">End Date</label>
          <Calendar 
            value={filters.endDate}
            onChange={(e) => onFilterChange('endDate', e.value)}
            showIcon
            className="w-full"
            placeholder="To date"
            dateFormat="yy-mm-dd"
            minDate={filters.startDate}
          />
        </div>
        
        <div className="col-12 md:col-2">
          <label className="block text-900 font-medium mb-2">Min Price</label>
          <InputText 
            type="number"
            value={filters.minPrice}
            onChange={(e) => onFilterChange('minPrice', e.target.value)}
            placeholder="0"
            className="w-full"
          />
        </div>
        
        <div className="col-12 md:col-2">
          <label className="block text-900 font-medium mb-2">Max Price</label>
          <InputText 
            type="number"
            value={filters.maxPrice}
            onChange={(e) => onFilterChange('maxPrice', e.target.value)}
            placeholder="Any"
            className="w-full"
          />
        </div>
        
        <div className="col-12 flex gap-2 justify-content-end">
          <Button 
            label="Reset" 
            icon="pi pi-filter-slash"
            className="p-button-outlined"
            onClick={onReset}
          />
          <Button 
            label="Search" 
            icon="pi pi-search"
            onClick={onSearch}
          />
        </div>
      </div>
    </Card>
  );
};