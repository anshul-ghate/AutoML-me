#!/usr/bin/env bash
# Mount frontend into the container and run tests headlessly
docker run --rm \
  -v $PWD/frontend:/e2e \
  -w /e2e \
  -u node \
  cypress/included:15.3.0
