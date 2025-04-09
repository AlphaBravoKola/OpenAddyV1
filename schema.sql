-- Properties table
create table properties (
  id uuid default uuid_generate_v4() primary key,
  landlord_id uuid references auth.users(id) not null,
  name text not null,
  address text not null,
  units integer not null,
  type text not null,
  has_instructions boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Property instructions table
create table property_instructions (
  id uuid default uuid_generate_v4() primary key,
  property_id uuid references properties(id) on delete cascade not null,
  package_location text,
  special_instructions text,
  access_code text,
  access_notes text,
  authorized_services jsonb default '{"amazon": false, "fedex": false, "ups": false, "usps": false, "dhl": false}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Package Claims Table
create table package_claims (
  id uuid default uuid_generate_v4() primary key,
  property_id uuid references properties(id) on delete cascade not null,
  recipient_name text not null,
  delivery_service text not null,
  tracking_number text,
  claim_date timestamp with time zone default timezone('utc'::text, now()) not null,
  status text not null default 'open',
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table properties enable row level security;
alter table property_instructions enable row level security;
alter table package_claims enable row level security;

-- Create policies
create policy "Users can view their own properties"
  on properties for select
  using (auth.uid() = landlord_id);

create policy "Users can insert their own properties"
  on properties for insert
  with check (auth.uid() = landlord_id);

create policy "Users can update their own properties"
  on properties for update
  using (auth.uid() = landlord_id);

create policy "Users can delete their own properties"
  on properties for delete
  using (auth.uid() = landlord_id);

create policy "Users can view instructions for their properties"
  on property_instructions for select
  using (
    exists (
      select 1 from properties
      where properties.id = property_instructions.property_id
      and properties.landlord_id = auth.uid()
    )
  );

create policy "Users can insert instructions for their properties"
  on property_instructions for insert
  with check (
    exists (
      select 1 from properties
      where properties.id = property_instructions.property_id
      and properties.landlord_id = auth.uid()
    )
  );

create policy "Users can update instructions for their properties"
  on property_instructions for update
  using (
    exists (
      select 1 from properties
      where properties.id = property_instructions.property_id
      and properties.landlord_id = auth.uid()
    )
  );

create policy "Users can delete instructions for their properties"
  on property_instructions for delete
  using (
    exists (
      select 1 from properties
      where properties.id = property_instructions.property_id
      and properties.landlord_id = auth.uid()
    )
  );

-- Create policies for package_claims
create policy "Users can view their own property claims"
  on package_claims for select
  using (
    exists (
      select 1 from properties
      where properties.id = package_claims.property_id
      and properties.landlord_id = auth.uid()
    )
  );

create policy "Users can insert claims for their properties"
  on package_claims for insert
  with check (
    exists (
      select 1 from properties
      where properties.id = package_claims.property_id
      and properties.landlord_id = auth.uid()
    )
  );

create policy "Users can update claims for their properties"
  on package_claims for update
  using (
    exists (
      select 1 from properties
      where properties.id = package_claims.property_id
      and properties.landlord_id = auth.uid()
    )
  );

create policy "Users can delete claims for their properties"
  on package_claims for delete
  using (
    exists (
      select 1 from properties
      where properties.id = package_claims.property_id
      and properties.landlord_id = auth.uid()
    )
  ); 