-- Function to create a new landlord
create or replace function create_landlord(
    user_id uuid,
    user_email text,
    username text,
    first_name text,
    last_name text,
    phone_number text default null,
    company_name text default null,
    business_address text default null,
    tax_id text default null
) returns void as $$
begin
    -- Insert into users table
    insert into users (id, email, username, user_type)
    values (user_id, user_email, username, 'landlord');
    
    -- Insert into landlords table
    insert into landlords (id, first_name, last_name, phone_number, company_name, business_address, tax_id)
    values (user_id, first_name, last_name, phone_number, company_name, business_address, tax_id);
end;
$$ language plpgsql security definer;

-- Function to create a new driver
create or replace function create_driver(
    user_id uuid,
    user_email text,
    username text,
    first_name text,
    last_name text,
    delivery_service text,
    service_id text default null,
    driver_license_number text default null,
    vehicle_type text default null,
    vehicle_plate text default null
) returns void as $$
begin
    -- Insert into users table
    insert into users (id, email, username, user_type)
    values (user_id, user_email, username, 'driver');
    
    -- Insert into drivers table
    insert into drivers (
        id, first_name, last_name, delivery_service, 
        service_id, driver_license_number, vehicle_type, vehicle_plate
    )
    values (
        user_id, first_name, last_name, delivery_service,
        service_id, driver_license_number, vehicle_type, vehicle_plate
    );
end;
$$ language plpgsql security definer;

-- Function to get user type and details
create or replace function get_user_details(user_id uuid)
returns jsonb as $$
declare
    result jsonb;
begin
    -- Get base user info
    select jsonb_build_object(
        'id', u.id,
        'email', u.email,
        'username', u.username,
        'user_type', u.user_type
    )
    into result
    from users u
    where u.id = user_id;

    -- Add type-specific details
    case result->>'user_type'
        when 'landlord' then
            select result || jsonb_build_object(
                'first_name', l.first_name,
                'last_name', l.last_name,
                'phone_number', l.phone_number,
                'company_name', l.company_name,
                'verification_status', l.verification_status
            )
            into result
            from landlords l
            where l.id = user_id;
            
        when 'driver' then
            select result || jsonb_build_object(
                'first_name', d.first_name,
                'last_name', d.last_name,
                'delivery_service', d.delivery_service,
                'background_check_status', d.background_check_status
            )
            into result
            from drivers d
            where d.id = user_id;
    end case;

    return result;
end;
$$ language plpgsql security definer; 