/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-types */
import {
  AuthenticationDetails,
  ChallengeName,
  CognitoUser,
  CognitoUserAttribute,
  CognitoUserPool,
  CognitoUserSession,
  IAuthenticationDetailsData,
} from 'amazon-cognito-identity-js';
import { ENV } from '../config';

export interface ISessionUserAttributes {
  profile: string;
  nickname: string;
  phone_number: string;
  given_name: string;
  family_name: string;
  email: string;
  email_verified: boolean;
  phone_number_verified: boolean;
}

export enum SessionStep {
  LOGIN = 'LOGIN',
  NEW_PASSWORD_REQUIRED = 'NEW_PASSWORD_REQUIRED',
  LOGGED = 'LOGGED',
  MFA_SETUP = 'MFA_SETUP',
  MFA_REQUIRED = 'MFA_REQUIRED',
}

class CognitoService {
  private userPool: CognitoUserPool;

  private currentUser: CognitoUser | null;

  private sessionUserAttributes: ISessionUserAttributes | null;

  private sessionStep: SessionStep;

  private mfaSecretCode: string | null;

  constructor() {
    this.userPool = new CognitoUserPool({
      UserPoolId: ENV.COGNITO_USER_POOL_ID,
      ClientId: ENV.COGNITO_APP_CLIENT_ID,
      // Storage: CookieStorage({domain: ".yourdomain.com"})
    });

    const existingUser = this.userPool.getCurrentUser();

    if (existingUser) {
      this.currentUser = existingUser;
      this.sessionStep = SessionStep.LOGGED;
    } else {
      this.sessionStep = SessionStep.LOGIN;
    }
  }

  async signIn(email: string, password: string) {
    return new Promise<void>((resolve, reject) => {
      const authenticationDetailsData: IAuthenticationDetailsData = {
        Username: email,
        Password: password,
      };

      const authenticationDetails = new AuthenticationDetails(
        authenticationDetailsData,
      );

      this.currentUser = this.getCognitoUser(email);

      this.currentUser.authenticateUser(authenticationDetails, {
        onSuccess: () => {
          this.sessionStep = SessionStep.LOGGED;
          resolve();
        },
        onFailure: err => {
          reject(err);
        },
        newPasswordRequired: (userAttributes, requiredAttributes) =>
          this.onNewPasswordRequired(
            userAttributes,
            requiredAttributes,
            resolve,
          ),
        mfaSetup: (challengeName, challengeParameters) =>
          this.onMfaSetup(challengeName, challengeParameters, resolve),
        totpRequired: (challengeName, challengeParameters) =>
          this.onTotpRequired(challengeName, challengeParameters, resolve),
      });
    }).catch(err => {
      throw err;
    });
  }

  private onNewPasswordRequired(
    userAttributes: ISessionUserAttributes,
    requiredAttributes: ISessionUserAttributes,
    resolve: Function,
  ) {
    this.sessionUserAttributes = userAttributes;
    this.sessionStep = SessionStep.NEW_PASSWORD_REQUIRED;
    resolve();
  }

  async handleNewPasswordRequired(newPassword: string) {
    const requiredAttributeData = {
      profile: this.sessionUserAttributes?.profile,
      nickname: this.sessionUserAttributes?.nickname,
      given_name: this.sessionUserAttributes?.given_name,
      family_name: this.sessionUserAttributes?.family_name,
    };

    return new Promise((resolve, reject) => {
      this.currentUser?.completeNewPasswordChallenge(
        newPassword,
        requiredAttributeData,
        {
          onSuccess: res => {
            this.sessionStep = SessionStep.LOGIN;
            resolve(res);
          },
          onFailure: err => {
            reject(err);
          },
          newPasswordRequired: (userAttributes, requiredAttributes) =>
            this.onNewPasswordRequired(
              userAttributes,
              requiredAttributes,
              resolve,
            ),
          mfaSetup: (challengeName, challengeParameters) =>
            this.onMfaSetup(challengeName, challengeParameters, resolve),
          totpRequired: (challengeName, challengeParameters) =>
            this.onTotpRequired(challengeName, challengeParameters, resolve),
        },
      );
    }).catch(err => {
      throw err;
    });
  }

  private async onMfaSetup(
    challengeName: ChallengeName,
    challengeParameters: any,
    resolve: Function,
  ) {
    this.sessionStep = SessionStep.MFA_SETUP;

    return new Promise<void>((resolveFn, reject) => {
      this.currentUser?.associateSoftwareToken({
        associateSecretCode: secretCode => {
          this.mfaSecretCode = secretCode;
          resolveFn();
          resolve();
        },
        onFailure: err => {
          reject(err);
        },
      });
    }).catch(err => {
      throw err;
    });
  }

  async handleVerifySoftwareTokenMfaSetup(
    totpCode: string,
    friendlyDeviceName: string,
  ) {
    return new Promise<void>((resolve, reject) => {
      this.currentUser?.verifySoftwareToken(totpCode, friendlyDeviceName, {
        onSuccess: () => {
          this.sessionStep = SessionStep.LOGGED;
          resolve();
        },
        onFailure: err => {
          reject(err);
        },
      });
    }).catch(err => {
      throw err;
    });
  }

  private async onTotpRequired(
    challengeName: ChallengeName,
    challengeParameters: any,
    resolve: Function,
  ) {
    this.sessionStep = SessionStep.MFA_REQUIRED;

    resolve();
  }

  async handleVerifySoftwareTokenMfa(secretCode: string) {
    return new Promise<void>((resolve, reject) => {
      this.currentUser?.sendMFACode(
        secretCode,
        {
          onSuccess: () => {
            this.sessionStep = SessionStep.LOGGED;
            resolve();
          },
          onFailure: err => {
            reject(err);
          },
        },
        'SOFTWARE_TOKEN_MFA',
      );
    }).catch(err => {
      throw err;
    });
  }

  async getUserAttributes() {
    return new Promise<CognitoUserAttribute[]>((resolve, reject) => {
      this.currentUser?.getUserAttributes((err, attributes) => {
        if (err || !attributes) {
          reject(err);
        } else {
          resolve(attributes);
        }
      });
    }).catch(err => {
      throw err;
    });
  }

  async getSession() {
    return new Promise<CognitoUserSession>((resolve, reject) => {
      this.currentUser?.getSession(
        (err: Error | null, session: CognitoUserSession) => {
          if (err) {
            reject(err);
          } else {
            resolve(session);
          }
        },
      );
    }).catch(err => {
      throw err;
    });
  }

  async signOut() {
    return new Promise<void>((resolve, reject) => {
      this.currentUser?.globalSignOut({
        onSuccess: () => {
          this.sessionStep = SessionStep.LOGIN;
          resolve();
        },
        onFailure: err => {
          reject(err);
        },
      });
    }).catch(err => {
      throw err;
    });
  }

  getCurrentSessionStep() {
    return this.sessionStep;
  }

  getMfaSecretCode() {
    return this.mfaSecretCode;
  }

  private getCognitoUser(email: string) {
    const cognitoUser = new CognitoUser({
      Pool: this.userPool,
      Username: email,
    });

    return cognitoUser;
  }
}

export const Cognito = new CognitoService();

// export async function verifyCode(username: string, code: string) {
//   return new Promise(function (resolve, reject) {
//     const cognitoUser = getCognitoUser(username);

//     cognitoUser.confirmRegistration(code, true, function (err, result) {
//       if (err) {
//         reject(err);
//       } else {
//         resolve(result);
//       }
//     });
//   }).catch((err) => {
//     throw err;
//   });
// }

// export async function setAttribute(attribute: any) {
//   return new Promise(function (resolve, reject) {
//     const attributeList = [];
//     const res = new CognitoUserAttribute(attribute);
//     // @ts-ignore
//     attributeList.push(res);

//     currentUser.updateAttributes(attributeList, (err: any, res: any) => {
//       if (err) {
//         reject(err);
//       } else {
//         resolve(res);
//       }
//     });
//   }).catch((err) => {
//     throw err;
//   });
// }

// export async function sendCode(username: string) {
//   return new Promise(function (resolve, reject) {
//     const cognitoUser = getCognitoUser(username);

//     if (!cognitoUser) {
//       reject(`could not find ${username}`);
//       return;
//     }

//     cognitoUser.forgotPassword({
//       onSuccess(res) {
//         resolve(res);
//       },
//       onFailure(err) {
//         reject(err);
//       },
//     });
//   }).catch((err) => {
//     throw err;
//   });
// }

// export async function forgotPassword(
//   username: string,
//   code: string,
//   password: string
// ) {
//   return new Promise(function (resolve, reject) {
//     const cognitoUser = getCognitoUser(username);

//     if (!cognitoUser) {
//       reject(`could not find ${username}`);
//       return;
//     }

//     cognitoUser.confirmPassword(code, password, {
//       onSuccess() {
//         resolve("password updated");
//       },
//       onFailure(err) {
//         reject(err);
//       },
//     });
//   });
// }

// export async function changePassword(oldPassword: string, newPassword: string) {
//   return new Promise(function (resolve, reject) {
//     currentUser.changePassword(
//       oldPassword,
//       newPassword,
//       function (err: any, res: any) {
//         if (err) {
//           reject(err);
//         } else {
//           resolve(res);
//         }
//       }
//     );
//   });
// }
