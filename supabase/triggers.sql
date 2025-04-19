-- Function to update timestamp
create or replace function update_timestamp()
returns trigger as $$
begin
    new.updated_at = timezone('utc'::text, now());
    return new;
end;
$$ language plpgsql;

-- Trigger for users table
create trigger update_users_timestamp
    before update on users
    for each row
    execute function update_timestamp();

-- Trigger for landlords table
create trigger update_landlords_timestamp
    before update on landlords
    for each row
    execute function update_timestamp();

-- Trigger for drivers table
create trigger update_drivers_timestamp
    before update on drivers
    for each row
    execute function update_timestamp();

-- Trigger for properties table
create trigger update_properties_timestamp
    before update on properties
    for each row
    execute function update_timestamp();

-- Function to validate delivery service
create or replace function validate_delivery_service()
returns trigger as $$
begin
    if not exists (
        select 1 from delivery_services
        where id = new.delivery_service
        and is_active = true
    ) then
        raise exception 'Invalid or inactive delivery service';
    end if;
    return new;
end;
$$ language plpgsql;

-- Trigger for drivers table to validate delivery service
create trigger validate_driver_delivery_service
    before insert or update on drivers
    for each row
    execute function validate_delivery_service();

-- Function to validate authorized services
create or replace function validate_authorized_services()
returns trigger as $$
begin
    if exists (
        select 1
        from unnest(new.authorized_services) as service
        where not exists (
            select 1 from delivery_services
            where id = service
            and is_active = true
        )
    ) then
        raise exception 'One or more invalid or inactive delivery services';
    end if;
    return new;
end;
$$ language plpgsql;

-- Trigger for properties table to validate authorized services
create trigger validate_property_authorized_services
    before insert or update on properties
    for each row
    execute function validate_authorized_services(); 