# contentful_maps
Endpoint to query map information from contentful


## Install
- ./setup.sh

## Deploy
### Requirements
- [hesdeploy](https://github.com/ndlib/hesburgh_utilities/blob/master/scripts/HESDEPLOY.md) (pip install hesdeploy)
- Access to corpfs
- AWS Credentials

### To deploy
1. Source `.../Departmental/Infrastructure/vars/WSE/secret_[stage]/contentful_maps/deploy-env` before deploying.
2. Assume appropriate AWS role and run `hesdeploy` (e.g. `aws-vault exec [role] -- hesdeploy -s [stage] --update`)
