# contentful_maps
Endpoint to query map information from contentful


## Install
- ./setup.sh

## Deploy
### Requirements
- Access to corpfs
- AWS Credentials

### To deploy
Assume appropriate AWS role and run `./scripts/codebuild/local.sh` (e.g. `aws-vault exec [role] -- ./scripts/codebuild/local.sh`)
