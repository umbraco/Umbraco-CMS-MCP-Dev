#!/bin/bash
# Wrapper script to run dotnet commands with proper proxy setup
# Usage: ./dotnet-with-proxy.sh <dotnet-args>
# Example: ./dotnet-with-proxy.sh restore
#          ./dotnet-with-proxy.sh build

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Setup proxy if needed
source "$SCRIPT_DIR/setup-dotnet-proxy.sh"

# Ensure dotnet is in PATH
export PATH="$HOME/.dotnet:$PATH"

# Run dotnet with the provided arguments
exec dotnet "$@"
