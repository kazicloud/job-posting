/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as admin from "../admin.js";
import type * as adminHelpers from "../adminHelpers.js";
import type * as analytics from "../analytics.js";
import type * as applicationMutations from "../applicationMutations.js";
import type * as applications from "../applications.js";
import type * as billing from "../billing.js";
import type * as clearData from "../clearData.js";
import type * as clerk from "../clerk.js";
import type * as clerkActions from "../clerkActions.js";
import type * as crons from "../crons.js";
import type * as cvParser from "../cvParser.js";
import type * as cvUpload from "../cvUpload.js";
import type * as dashboard from "../dashboard.js";
import type * as debugApplications from "../debugApplications.js";
import type * as educationSkillsMutations from "../educationSkillsMutations.js";
import type * as emails from "../emails.js";
import type * as employerDocuments from "../employerDocuments.js";
import type * as employerOnboarding from "../employerOnboarding.js";
import type * as http from "../http.js";
import type * as jobMutations from "../jobMutations.js";
import type * as jobs from "../jobs.js";
import type * as matching from "../matching.js";
import type * as metamapVerification from "../metamapVerification.js";
import type * as onboarding from "../onboarding.js";
import type * as profile from "../profile.js";
import type * as profileChangeRequests from "../profileChangeRequests.js";
import type * as profileMutations from "../profileMutations.js";
import type * as profileQueries from "../profileQueries.js";
import type * as profiles from "../profiles.js";
import type * as recommendations from "../recommendations.js";
import type * as search from "../search.js";
import type * as seedJobs from "../seedJobs.js";
import type * as seedJobsForUser from "../seedJobsForUser.js";
import type * as serviceOrders from "../serviceOrders.js";
import type * as signupValidation from "../signupValidation.js";
import type * as users from "../users.js";
import type * as wishlist from "../wishlist.js";
import type * as workExperienceMutations from "../workExperienceMutations.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  admin: typeof admin;
  adminHelpers: typeof adminHelpers;
  analytics: typeof analytics;
  applicationMutations: typeof applicationMutations;
  applications: typeof applications;
  billing: typeof billing;
  clearData: typeof clearData;
  clerk: typeof clerk;
  clerkActions: typeof clerkActions;
  crons: typeof crons;
  cvParser: typeof cvParser;
  cvUpload: typeof cvUpload;
  dashboard: typeof dashboard;
  debugApplications: typeof debugApplications;
  educationSkillsMutations: typeof educationSkillsMutations;
  emails: typeof emails;
  employerDocuments: typeof employerDocuments;
  employerOnboarding: typeof employerOnboarding;
  http: typeof http;
  jobMutations: typeof jobMutations;
  jobs: typeof jobs;
  matching: typeof matching;
  metamapVerification: typeof metamapVerification;
  onboarding: typeof onboarding;
  profile: typeof profile;
  profileChangeRequests: typeof profileChangeRequests;
  profileMutations: typeof profileMutations;
  profileQueries: typeof profileQueries;
  profiles: typeof profiles;
  recommendations: typeof recommendations;
  search: typeof search;
  seedJobs: typeof seedJobs;
  seedJobsForUser: typeof seedJobsForUser;
  serviceOrders: typeof serviceOrders;
  signupValidation: typeof signupValidation;
  users: typeof users;
  wishlist: typeof wishlist;
  workExperienceMutations: typeof workExperienceMutations;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
