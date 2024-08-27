import type * as types from './types';
import type { ConfigOptions, FetchResponse } from 'api/dist/core'
import Oas from 'oas';
import APICore from 'api/dist/core';
import definition from './openapi.json';

class SDK {
  spec: Oas;
  core: APICore;

  constructor() {
    this.spec = Oas.init(definition);
    this.core = new APICore(this.spec, 'ideogram/1.0.0 (api/6.1.2)');
  }

  /**
   * Optionally configure various options that the SDK allows.
   *
   * @param config Object of supported SDK options and toggles.
   * @param config.timeout Override the default `fetch` request timeout of 30 seconds. This number
   * should be represented in milliseconds.
   */
  config(config: ConfigOptions) {
    this.core.setConfig(config);
  }

  /**
   * If the API you're using requires authentication you can supply the required credentials
   * through this method and the library will magically determine how they should be used
   * within your API request.
   *
   * With the exception of OpenID and MutualTLS, it supports all forms of authentication
   * supported by the OpenAPI specification.
   *
   * @example <caption>HTTP Basic auth</caption>
   * sdk.auth('username', 'password');
   *
   * @example <caption>Bearer tokens (HTTP or OAuth 2)</caption>
   * sdk.auth('myBearerToken');
   *
   * @example <caption>API Keys</caption>
   * sdk.auth('myApiKey');
   *
   * @see {@link https://spec.openapis.org/oas/v3.0.3#fixed-fields-22}
   * @see {@link https://spec.openapis.org/oas/v3.1.0#fixed-fields-22}
   * @param values Your auth credentials for the API; can specify up to two strings or numbers.
   */
  auth(...values: string[] | number[]) {
    this.core.setAuth(...values);
    return this;
  }

  /**
   * If the API you're using offers alternate server URLs, and server variables, you can tell
   * the SDK which one to use with this method. To use it you can supply either one of the
   * server URLs that are contained within the OpenAPI definition (along with any server
   * variables), or you can pass it a fully qualified URL to use (that may or may not exist
   * within the OpenAPI definition).
   *
   * @example <caption>Server URL with server variables</caption>
   * sdk.server('https://{region}.api.example.com/{basePath}', {
   *   name: 'eu',
   *   basePath: 'v14',
   * });
   *
   * @example <caption>Fully qualified server URL</caption>
   * sdk.server('https://eu.api.example.com/v14');
   *
   * @param url Server URL
   * @param variables An object of variables to replace into the server URL.
   */
  server(url: string, variables = {}) {
    this.core.setServer(url, variables);
  }

  /**
   * Describe an image
   *
   * @throws FetchError<422, types.PostDescribeResponse422> Image failed the safety check.
   */
  post_describe(body: types.PostDescribeBodyParam): Promise<FetchResponse<200, types.PostDescribeResponse200>> {
    return this.core.fetch('/describe', 'post', body);
  }

  /**
   * Generates images synchronously based on a given prompt and optional parameters.
   *
   * @throws FetchError<422, types.PostGenerateImageResponse422> Prompt failed the safety check.
   */
  post_generate_image(body: types.PostGenerateImageBodyParam): Promise<FetchResponse<200, types.PostGenerateImageResponse200>> {
    return this.core.fetch('/generate', 'post', body);
  }

  /**
   * Retrieve current API keys and their respective data.
   *
   */
  get_api_keys(): Promise<FetchResponse<200, types.GetApiKeysResponse200>> {
    return this.core.fetch('/manage/api/api_keys', 'get');
  }

  /**
   * Creates an API key.
   *
   */
  create_api_key(): Promise<FetchResponse<200, types.CreateApiKeyResponse200>> {
    return this.core.fetch('/manage/api/api_keys', 'post');
  }

  /**
   * Delete an API key.
   *
   */
  delete_single_api_key(metadata: types.DeleteSingleApiKeyMetadataParam): Promise<FetchResponse<number, unknown>> {
    return this.core.fetch('/manage/api/api_keys/{api_key_id}', 'delete', metadata);
  }

  /**
   * Retrieve data relevant to connecting to Stripe.
   *
   */
  get_api_stripe_subscription(metadata?: types.GetApiStripeSubscriptionMetadataParam): Promise<FetchResponse<200, types.GetApiStripeSubscriptionResponse200>> {
    return this.core.fetch('/manage/api/stripe_subscription', 'get', metadata);
  }

  /**
   * Retrieve data relevant to creating an API subscription.
   *
   */
  get_api_subscription(): Promise<FetchResponse<200, types.GetApiSubscriptionResponse200>> {
    return this.core.fetch('/manage/api/subscription', 'get');
  }

  /**
   * Update API subscription settings
   *
   * @throws FetchError<400, types.PostApiSubscriptionResponse400> Bad request
   */
  post_api_subscription(body: types.PostApiSubscriptionBodyParam): Promise<FetchResponse<200, types.PostApiSubscriptionResponse200>> {
    return this.core.fetch('/manage/api/subscription', 'post', body);
  }

  /**
   * Retrieve the latest terms of service for API usage.
   *
   */
  get_api_terms(): Promise<FetchResponse<200, types.GetApiTermsResponse200>> {
    return this.core.fetch('/manage/api/terms', 'get');
  }

  /**
   * Accept terms
   *
   */
  post_api_terms(body: types.PostApiTermsBodyParam): Promise<FetchResponse<number, unknown>> {
    return this.core.fetch('/manage/api/terms', 'post', body);
  }

  /**
   * Remix provided images synchronously based on a given prompt and optional parameters
   *
   * @throws FetchError<422, types.PostRemixImageResponse422> Prompt or provided image failed safety check.
   */
  post_remix_image(body: types.PostRemixImageBodyParam): Promise<FetchResponse<200, types.PostRemixImageResponse200>> {
    return this.core.fetch('/remix', 'post', body);
  }

  /**
   * Upscale provided images synchronously with an optional prompt.
   *
   * @throws FetchError<422, types.PostUpscaleImageResponse422> Prompt or provided image failed safety check.
   */
  post_upscale_image(body: types.PostUpscaleImageBodyParam): Promise<FetchResponse<200, types.PostUpscaleImageResponse200>> {
    return this.core.fetch('/upscale', 'post', body);
  }
}

const createSDK = (() => { return new SDK(); })()
;

export default createSDK;

export type { CreateApiKeyResponse200, DeleteSingleApiKeyMetadataParam, GetApiKeysResponse200, GetApiStripeSubscriptionMetadataParam, GetApiStripeSubscriptionResponse200, GetApiSubscriptionResponse200, GetApiTermsResponse200, PostApiSubscriptionBodyParam, PostApiSubscriptionResponse200, PostApiSubscriptionResponse400, PostApiTermsBodyParam, PostDescribeBodyParam, PostDescribeResponse200, PostDescribeResponse422, PostGenerateImageBodyParam, PostGenerateImageResponse200, PostGenerateImageResponse422, PostRemixImageBodyParam, PostRemixImageResponse200, PostRemixImageResponse422, PostUpscaleImageBodyParam, PostUpscaleImageResponse200, PostUpscaleImageResponse422 } from './types';
