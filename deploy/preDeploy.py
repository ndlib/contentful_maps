from hesburgh import scriptutil, heslog

def gitVersion(stage):
  rev = scriptutil.executeCommand('git rev-parse --short HEAD')
  if rev.get("code") != 0:
    # there was an error, return the stage name
    heslog.warn("Couldn't get git rev %s" % rev)
    return stage
  return rev.get("output").strip()


def run(stage):
  scriptutil.executeCommand('cd ../src && pip install -r requirements.txt --target . --no-deps')

  return { "env": { "GIT_VERSION": gitVersion(stage) } }
