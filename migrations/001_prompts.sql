create table if not exists prompts (
  id text not null,
  channel text not null check (channel in ('production', 'preview')),
  title text not null,
  summary text not null default '',
  medium text not null check (medium in ('image', 'video')),
  model text not null,
  prompt text not null,
  negative_prompt text not null default '',
  params text not null default '',
  style text not null default '',
  aspect text not null default '1:1',
  tags text not null default '',
  author_sub text not null,
  author_name text not null,
  likes integer not null default 0,
  featured boolean not null default false,
  created_at timestamptz not null default now(),
  primary key (id, channel)
);

create table if not exists prompt_likes (
  prompt_id text not null,
  channel text not null,
  viewer_sub text not null,
  created_at timestamptz not null default now(),
  primary key (prompt_id, channel, viewer_sub),
  foreign key (prompt_id, channel) references prompts (id, channel) on delete cascade
);

create index if not exists prompts_channel_created_idx on prompts (channel, created_at desc);

create table if not exists app_meta (
  key text primary key,
  value text not null
);
