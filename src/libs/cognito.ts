/* eslint-disable no-param-reassign */
import {
  AuthenticationDetails,
  CognitoUser,
  CognitoUserPool,
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
}

export enum SessionStep {
  LOGIN = 'LOGIN',
  NEW_PASSWORD_REQUIRED = 'NEW_PASSWORD_REQUIRED',
  LOGGED = 'LOGGED',
}

class CognitoService {
  private userPool: CognitoUserPool;

  private currentUser: CognitoUser | null;

  private sessionUserAttributes: ISessionUserAttributes | null;

  private sessionStep: SessionStep;

  constructor() {
    this.userPool = new CognitoUserPool({
      UserPoolId: ENV.COGNITO_USER_POOL_ID,
      ClientId: ENV.COGNITO_APP_CLIENT_ID,
    });
    this.sessionStep = SessionStep.LOGIN;
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
        onSuccess: res => {
          this.sessionStep = SessionStep.LOGGED;

          console.log(res);
          resolve();
        },
        onFailure: err => {
          reject(err);
        },
        newPasswordRequired: userAttributes => {
          delete userAttributes.email_verified;
          this.sessionUserAttributes = userAttributes;
          this.sessionStep = SessionStep.NEW_PASSWORD_REQUIRED;

          resolve();
        },
      });
    }).catch(err => {
      throw err;
    });
  }

  async handleNewPasswordRequired(newPassword: string) {
    return new Promise((resolve, reject) => {
      this.currentUser?.completeNewPasswordChallenge(
        newPassword,
        this.sessionUserAttributes,
        {
          onSuccess: res => {
            this.sessionStep = SessionStep.LOGIN;
            resolve(res);
          },
          onFailure: err => {
            reject(err);
          },
        },
      );
    }).catch(err => {
      throw err;
    });
  }

  signOut() {
    this.currentUser?.signOut();
  }

  getCurrentSessionStep() {
    return this.sessionStep;
  }

  private getCurrentUser() {
    return this.currentUser;
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

// let sessionUserAttributes;

// export async function getSession() {
//   if (!currentUser) {
//     currentUser = userPool.getCurrentUser();
//   }

//   return new Promise(function (resolve, reject) {
//     currentUser.getSession(function (err: any, session: any) {
//       if (err) {
//         reject(err);
//       } else {
//         resolve(session);
//       }
//     });
//   }).catch((err) => {
//     throw err;
//   });
// }

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

// export async function getAttributes() {
//   return new Promise(function (resolve, reject) {
//     currentUser.getUserAttributes(function (err: any, attributes: any) {
//       if (err) {
//         reject(err);
//       } else {
//         resolve(attributes);
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
