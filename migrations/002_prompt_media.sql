alter table prompts add column if not exists cover_url text not null default '';
alter table prompts add column if not exists media_url text not null default '';
