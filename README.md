# contentful_maps
Endpoint to query map information from contentful


## Install
- ./setup.sh

## Deploy
### Requirements
- [hesdeploy](https://github.com/ndlib/hesburgh_utilities/blob/master/scripts/HESDEPLOY.md) (pip install hesdeploy)
- Access to corpfs
- AWS Credentials
- An instance of ContentfulDirect

### To deploy
- Source `.../Departmental/Infrastructure/vars/WSE/secret_[stage]/gatekeeper/serverless-env` before deploying.
- Ensure that the sourced variable DIRECT_ENDPOINT points at the endpoint you wish to deploy to.
- Assume appropriate AWS role and run `hesdeploy`
