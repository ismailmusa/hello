import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'
import { verify} from 'jsonwebtoken'
import { createLogger } from '../../utils/logger'
import Axios from 'axios'
import { JwtPayload } from '../../auth/JwtPayload'

const jwksUrl = 'https://dev-ugabkenclglultkf.us.auth0.com/.well-known/jwks.json';

export const handler = async (
  event: CustomAuthorizerEvent
): Promise<CustomAuthorizerResult> => {
  logger.info('Authorizing a user', event.authorizationToken)
  try {
    const jwtToken = await verifyToken(event.authorizationToken)
    logger.info('User was authorized', jwtToken)

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('User not authorized', { error: e.message })

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

async function verifyToken(authHeader: string): Promise<JwtPayload> {
  logger.info('verifying token', authHeader.substring(0,20))
  const token = getToken(authHeader)
  const jwt: Jwt = decode(token, { complete: true }) as Jwt
   
  // TODO: Implement token verification
  // You should implement it similarly to how it was implemented for the exercise for the lesson 5
  // You can read more about how to do this here: https://auth0.com/blog/navigating-rs256-and-jwks/
  // return undefined
  const response = await Axios.get(jwksUrl)
  const keys = response.data.keys
  const signingkeys = keys.find(key => key.id === jwt.header.kid )
  logger.info('signingkeys', signingkeys)
  if(!signingkeys){
    throw new Error('the JWKS endpoint did not contain any keys')
  }
  // get pem data
  const pemdata = signingkeys.x5c[0]
  // convert pem data to cert
  const cert = ` -----BEGIN CERTIFICATE-----\n${pemdata}\n-----END CERTIFICATE-----`
  // verify token
  const verifiedToken = verify(token, cert,{ algorithms: ['RS256']}) as JwtPayload
  logger.info('verifiedToken', verifiedToken)
  return verifiedToken 
}

function getToken(authHeader: string): string {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return token
}


