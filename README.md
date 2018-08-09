# contentful_maps
Endpoint to query map information from contentful


## Install
- ./setup.sh

## Deploy
### Requirements
- [hesdeploy](https://github.com/ndlib/hesburgh_utilities/blob/master/scripts/HESDEPLOY.md) (pip install hesdeploy)
- Access to corpfs
- AWS Credentials
- !!An instance of ContentfulDirect!!

### To deploy
1. Source `.../Departmental/Infrastructure/vars/WSE/secret_[stage]/gatekeeper/serverless-env` before deploying.
2. Ensure that the sourced variable DIRECT_ENDPOINT points at the contentful direct endpoint you wish to deploy to.
3. Assume appropriate AWS role and run `hesdeploy`
