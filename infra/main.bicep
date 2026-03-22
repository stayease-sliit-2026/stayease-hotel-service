targetScope = 'resourceGroup'

@description('Location for Azure resources.')
param location string = resourceGroup().location

@description('Name of the Azure Container App.')
param containerAppName string = 'stayease-hotel-service'

@description('Name of the Container Apps managed environment.')
param environmentName string = 'stayease-hotel-service-env'

@description('Name of the Log Analytics workspace.')
param logAnalyticsWorkspaceName string = 'stayease-hotel-service-law'

@description('Container image to deploy.')
param imageName string

@description('MongoDB Atlas connection string.')
@secure()
param mongoUri string

@description('JWT secret used by the service.')
@secure()
param jwtSecret string

@description('Auth Service base URL.')
param authServiceUrl string

@description('Allowed CORS origins, comma-separated.')
param corsOrigins string

@description('Application container port.')
param containerPort int = 3002

resource logAnalyticsWorkspace 'Microsoft.OperationalInsights/workspaces@2023-09-01' = {
  name: logAnalyticsWorkspaceName
  location: location
  properties: {
    retentionInDays: 30
    sku: {
      name: 'PerGB2018'
    }
  }
}

resource logAnalyticsKeys 'Microsoft.OperationalInsights/workspaces/sharedKeys@2023-09-01' = {
  name: logAnalyticsWorkspace.name
  parent: logAnalyticsWorkspace
}

resource managedEnvironment 'Microsoft.App/managedEnvironments@2024-03-01' = {
  name: environmentName
  location: location
  properties: {
    appLogsConfiguration: {
      destination: 'log-analytics'
      logAnalyticsConfiguration: {
        customerId: logAnalyticsWorkspace.properties.customerId
        sharedKey: logAnalyticsKeys.properties.primarySharedKey
      }
    }
  }
}

resource containerApp 'Microsoft.App/containerApps@2024-03-01' = {
  name: containerAppName
  location: location
  properties: {
    managedEnvironmentId: managedEnvironment.id
    configuration: {
      ingress: {
        external: true
        targetPort: containerPort
        allowInsecure: false
        transport: 'auto'
      }
      activeRevisionsMode: 'Single'
      secrets: [
        {
          name: 'mongo-uri'
          value: mongoUri
        }
        {
          name: 'jwt-secret'
          value: jwtSecret
        }
      ]
    }
    template: {
      containers: [
        {
          name: 'hotel-service'
          image: imageName
          resources: {
            cpu: json('0.5')
            memory: '1Gi'
          }
          env: [
            {
              name: 'PORT'
              value: string(containerPort)
            }
            {
              name: 'MONGO_URI'
              secretRef: 'mongo-uri'
            }
            {
              name: 'AUTH_SERVICE_URL'
              value: authServiceUrl
            }
            {
              name: 'AUTH_VERIFY_PATH'
              value: '/auth/verify'
            }
            {
              name: 'CORS_ORIGINS'
              value: corsOrigins
            }
            {
              name: 'JWT_SECRET'
              secretRef: 'jwt-secret'
            }
          ]
        }
      ]
      scale: {
        minReplicas: 1
        maxReplicas: 3
      }
    }
  }
}

output containerAppUrl string = 'https://${containerApp.properties.configuration.ingress.fqdn}'