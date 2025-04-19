-- Base users table with minimal info
create table users (
    id uuid references auth.users primary key,
    email text unique not null,
    username text unique not null,
    user_type text check (user_type in ('driver', 'landlord', 'consumer')) not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Landlords table with landlord-specific info
create table landlords (
    id uuid references users(id) primary key,
    first_name text not null,
    last_name text not null,
    phone_number text,
    company_name text,
    business_address text,
    tax_id text,
    verification_status text default 'pending' check (verification_status in ('pending', 'verified', 'rejected')),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Drivers table with driver-specific info
create table drivers (
    id uuid references users(id) primary key,
    first_name text not null,
    last_name text not null,
    driver_license_number text,
    delivery_service text references delivery_services(id),
    service_id text,  -- ID assigned by their delivery service
    vehicle_type text,
    vehicle_plate text,
    background_check_status text default 'pending' check (background_check_status in ('pending', 'passed', 'failed')),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Delivery services reference table
create table delivery_services (
    id text primary key,  -- e.g., 'fedex', 'ups', etc.
    name text not null,
    is_active boolean default true,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Properties table (updated to reference landlords)
create table properties (
    id uuid default gen_random_uuid() primary key,
    landlord_id uuid references landlords(id) not null,
    name text not null,
    address text not null,
    unit_count integer,
    property_type text,
    authorized_services text[],
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Property instructions (unchanged)
create table property_instructions (
    id uuid default gen_random_uuid() primary key,
    property_id uuid references properties(id) not null,
    package_location text,
    access_code text,
    access_notes text,
    special_instructions text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Property updates (unchanged)
create table property_updates (
    id uuid default gen_random_uuid() primary key,
    property_id uuid references properties(id) not null,
    update_type text not null,
    description text not null,
    danger_level text check (danger_level in ('low', 'medium', 'high')) not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Package claims (updated to reference drivers)
create table package_claims (
    id uuid default gen_random_uuid() primary key,
    property_id uuid references properties(id) not null,
    driver_id uuid references drivers(id),
    recipient_name text not null,
    delivery_service text references delivery_services(id) not null,
    tracking_number text,
    status text default 'open' check (status in ('open', 'investigating', 'resolved')) not null,
    description text,
    resolution_notes text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS Policies
alter table users enable row level security;
alter table landlords enable row level security;
alter table drivers enable row level security;
alter table properties enable row level security;
alter table property_instructions enable row level security;
alter table property_updates enable row level security;
alter table package_claims enable row level security;
alter table delivery_services enable row level security;

-- Users policies
create policy "Users can view their own data"
    on users for select
    using (auth.uid() = id);

create policy "Users can update their own data"
    on users for update
    using (auth.uid() = id);

-- Landlords policies
create policy "Landlords can view their own data"
    on landlords for select
    using (auth.uid() = id);

create policy "Landlords can update their own data"
    on landlords for update
    using (auth.uid() = id);

-- Drivers policies
create policy "Drivers can view their own data"
    on drivers for select
    using (auth.uid() = id);

create policy "Drivers can update their own data"
    on drivers for update
    using (auth.uid() = id);

-- Properties policies
create policy "Landlords can view their own properties"
    on properties for select
    using (landlord_id = auth.uid());

create policy "Landlords can insert their own properties"
    on properties for insert
    with check (landlord_id = auth.uid());

create policy "Landlords can update their own properties"
    on properties for update
    using (landlord_id = auth.uid());

create policy "Landlords can delete their own properties"
    on properties for delete
    using (landlord_id = auth.uid());

-- Property instructions policies
create policy "Users can view property instructions"
    on property_instructions for select
    using (exists (
        select 1 from properties
        where properties.id = property_instructions.property_id
        and (properties.landlord_id = auth.uid() or auth.uid() in (
            select id from drivers where delivery_service = any(properties.authorized_services)
        ))
    ));

-- Package claims policies
create policy "Landlords can view their property claims"
    on package_claims for select
    using (exists (
        select 1 from properties
        where properties.id = package_claims.property_id
        and properties.landlord_id = auth.uid()
    ));

create policy "Drivers can view claims they created"
    on package_claims for select
    using (driver_id = auth.uid());

-- Indexes for performance
create index idx_users_user_type on users(user_type);
create index idx_properties_landlord_id on properties(landlord_id);
create index idx_package_claims_property_id on package_claims(property_id);
create index idx_package_claims_driver_id on package_claims(driver_id);
create index idx_property_instructions_property_id on property_instructions(property_id); 