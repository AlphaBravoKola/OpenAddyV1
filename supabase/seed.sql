-- Populate delivery services
insert into delivery_services (id, name, is_active) values
    ('fedex', 'FedEx', true),
    ('ups', 'UPS', true),
    ('usps', 'USPS', true),
    ('dhl', 'DHL', true),
    ('amazon', 'Amazon', true),
    ('ontrac', 'OnTrac', true),
    ('lasership', 'LaserShip', true);

-- Create test users (for development only)
-- Test landlord
insert into users (id, email, username, user_type) values 
    ('00000000-0000-0000-0000-000000000001', 'test.landlord@example.com', 'testlandlord', 'landlord');

insert into landlords (id, first_name, last_name, phone_number, company_name, business_address, tax_id) values
    ('00000000-0000-0000-0000-000000000001', 'Test', 'Landlord', '123-456-7890', 'Test Company', '123 Business St', 'TAX123');

-- Test driver
insert into users (id, email, username, user_type) values
    ('00000000-0000-0000-0000-000000000002', 'test.driver@example.com', 'testdriver', 'driver');

insert into drivers (id, first_name, last_name, delivery_service, service_id, driver_license_number, vehicle_type, vehicle_plate) values
    ('00000000-0000-0000-0000-000000000002', 'Test', 'Driver', 'fedex', 'DRV123', 'DL123456', 'Van', 'ABC123'); 