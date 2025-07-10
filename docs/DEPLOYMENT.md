# Project Handover: SwipeMyTalent Deployment

Deployment is **fully automated** using GitHub Actions. It builds and pushes Docker images for the backend and frontend to **GitHub Container Registry (GHCR)**, and then deploys the stack to a remote host using `cssnr/stack-deploy-action`.

---

## Workflow Overview

```yaml
name: CD

on:
  workflow_dispatch:
```

This deployment workflow is manually triggered via the GitHub Actions UI using the `workflow_dispatch` event.

## Workflow Jobs

1. `commit-hash`
Retrieves the full Git commit hash to be used as an image tag:

```yaml
jobs:
  commit-hash:
    runs-on: ubuntu-24.04
    outputs:
      commit_hash: ${{ steps.get_commit.outputs.commit_hash }}
    steps:
      - uses: actions/checkout@v4
      - name: Get commit hash
        id: get_commit
        run: echo "commit_hash=$(git rev-parse HEAD)" >> $GITHUB_OUTPUT
```

2. `push-images`
Builds and pushes Docker images for both backend and frontend:

```yaml
push-images:
    needs:
      - commit-hash
    runs-on: ubuntu-24.04
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Set short git commit SHA
        id: vars
        run: |
          calculatedSha=$(git rev-parse --short ${{ github.sha }})
          echo "COMMIT_SHORT_SHA=$calculatedSha" >> $GITHUB_ENV

      - name: Build backend image
        working-directory: ./backend
        run: docker build -f Dockerfile.prod -t ghcr.io/swipemytalent/backend:${{ needs.commit-hash.outputs.commit_hash }} .

      - name: Build frontend image
        working-directory: ./frontend
        run: docker build -f Dockerfile.prod -t ghcr.io/swipemytalent/frontend:${{ needs.commit-hash.outputs.commit_hash }} .

      - name: Log in to the Container registry
        uses: docker/login-action@v3
        with:
          registry: https://ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Push backend image
        uses: docker/build-push-action@v6
        with:
          context: ./backend
          file: ./backend/Dockerfile.prod
          push: true
          tags: ghcr.io/swipemytalent/backend:${{ needs.commit-hash.outputs.commit_hash }}

      - name: Push frontend image
        uses: docker/build-push-action@v6
        with:
          context: ./frontend
          file: ./frontend/Dockerfile.prod
          push: true
          tags: ghcr.io/swipemytalent/frontend:${{ needs.commit-hash.outputs.commit_hash }}
```

3. `deploy`
Deploys the app to the remote Docker Swarm host:

```yaml
 deploy:
    runs-on: ubuntu-24.04
    needs:
      - commit-hash
      - push-images
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Create env file
        run: |
          echo 'GIT_COMMIT_HASH="${{ github.sha }}"' >> .env

      - name: Deploy app
        uses: cssnr/stack-deploy-action@v1
        with:
          name: 'swipemytalent'
          file: 'compose.prod.yaml'
          host: ${{ secrets.REMOTE_HOST }}
          port: ${{ secrets.REMOTE_PORT }}
          user: ${{ secrets.DEPLOY_USER }}
          ssh_key: ${{ secrets.REMOTE_SSH_PRIVATE_KEY }}
          env_file: './.env'
          registry_auth: true
          registry_host: "ghcr.io"
          registry_user: swipemytalent
          registry_pass: ${{ secrets.GITHUB_TOKEN }}
```

## Required GitHub Secrets

| Secret Name              | Description                           |
| ------------------------ | ------------------------------------- |
| `REMOTE_HOST`            | IP or domain of the remote host       |
| `REMOTE_PORT`            | SSH port (default: 22)                |
| `DEPLOY_USER`            | SSH username for deployment           |
| `REMOTE_SSH_PRIVATE_KEY` | SSH private key for the deploy user   |
| `GITHUB_TOKEN`           | GitHub token (automatically provided) |

## Docker Compose: `compose.prod.yaml` example

```yaml
services:
  backend:
    image: ghcr.io/swipemytalent/backend:${GIT_COMMIT_HASH}
    ...
  frontend:
    image: ghcr.io/swipemytalent/frontend:${GIT_COMMIT_HASH}
    ...
```

## Highlights

- CI/CD pipeline is manually triggered for controlled deployments.
- Each deployment is tagged with the exact Git commit SHA.
- Docker images are built, tagged, and pushed to GHCR.
- Secure SSH deployment using Docker Swarm via `stack-deploy-action`.
- Secrets are stored and accessed securely using GitHub Actions secrets.
