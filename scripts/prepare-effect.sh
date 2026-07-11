#!/usr/bin/env sh

set -eu

repo_dir=".repos/effect"
repo_url="https://github.com/Effect-TS/effect-smol"
local_repo="/home/amaan/code/effect"

if [ -d "$repo_dir/.git" ]; then
  exit 0
fi

if [ -e "$repo_dir" ]; then
  exit 0
fi

mkdir -p ".repos"

if [ -d "$local_repo/.git" ]; then
  ln -s "$local_repo" "$repo_dir"
else
  git clone "$repo_url" "$repo_dir"
fi
