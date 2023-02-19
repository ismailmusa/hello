import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'
import { verify} from 'jsonwebtoken'
import { createLogger } from '../../utils/logger'
import Axios from 'axios'
import { JwtPayload } from '../../auth/JwtPayload'

const jwksUrl = 'https://dev-ugabkenclglultkf.us.auth0.com/.well-known/jwks.json';

async function verifyToken(authHeader: string): Promise<JwtPayload> {
  try {

    const token = getToken(authHeader)
    const res = await Axios.get(jwksUrl);

    const pemData = res['data']['keys'][0]['x5c'][0]
    const cert = `-----BEGIN CERTIFICATE-----\n${pemData}\n-----END CERTIFICATE-----`

    return verify(token, cert, { algorithms: ['RS256'] }) as JwtPayload
  } catch(err){
    logger.error('Fail to authenticate', err)
  }
}

const logger = createLogger('todo');
export const handler = async (
  event: CustomAuthorizerEvent
): Promise<CustomAuthorizerResult> => {

  logger.info('Authorizing a user', event.authorizationToken)

  try {

    const Token = await verifyToken(event.authorizationToken)

    logger.info('User was authorized', jwtToken)

    return {
      principalId: Token.sub,
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



function getToken(authHeader: string): string {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const Token = split[1]

  return Token
}

