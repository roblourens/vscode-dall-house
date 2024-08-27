const CreateApiKey = {"response":{"200":{"properties":{"api_key":{"description":"The API key to use when making authenticated requests with the API. This key will only be shown once.","title":"api_key","type":"string","examples":["vkpDjaKdMNR8QJ83GjfNvFZJbnoi65XUp70MgZNtA2H9XE8yfDnmr_6BaRyQkF9hnJzu6mUPRLBmqlnZMwetJA"]},"api_key_id":{"description":"The ID of the API key. A URL safe base64 encoded UUID","title":"api_key_id","type":"string","examples":["JRPVD7jWR1aTBYiJ0UFVOg=="]}},"required":["api_key","api_key_id"],"title":"PostApiKeyResponse","type":"object","$schema":"http://json-schema.org/draft-04/schema#"}}} as const
;
const DeleteSingleApiKey = {"metadata":{"allOf":[{"type":"object","properties":{"api_key_id":{"type":"string","examples":["d7abd0cd4ae94db78676e986a4ebd8dc"],"$schema":"http://json-schema.org/draft-04/schema#","description":"The ID of API key to operate on. Expected to be a URL safe Base64 encoded UUID."}},"required":["api_key_id"]}]}} as const
;
const GetApiKeys = {"response":{"200":{"properties":{"current_api_keys":{"default":[],"description":"The current API keys that are active. Only returns redacted keys.","items":{"description":"A representation of an API key that does not contain the full key.","properties":{"redacted_api_key":{"description":"A redacted text snippet of the API key. Contains the first 4 characters of the API key","title":"redacted_api_key","type":"string","examples":["vkpDja"]},"creation_time":{"description":"The time at which the key was created","format":"date-time","title":"creation_time","type":"string","examples":["2000-01-23T04:56:07.000Z"]},"api_key_id":{"description":"A URL safe base64 encoded UUID","title":"api_key_id","type":"string","examples":["JRPVD7jWR1aTBYiJ0UFVOg=="]}},"required":["api_key_id","creation_time","redacted_api_key"],"title":"RedactedApiKey","type":"object"},"title":"current_api_keys","type":"array"}},"title":"GetApiKeysResponse","type":"object","$schema":"http://json-schema.org/draft-04/schema#"}}} as const
;
const GetApiStripeSubscription = {"metadata":{"allOf":[{"type":"object","properties":{"isBusiness":{"type":"boolean","$schema":"http://json-schema.org/draft-04/schema#","description":"Whether the subscription is intended to be used for business or personal use."}},"required":[]}]},"response":{"200":{"properties":{"stripe_subscription_url":{"description":"The URL for the user to checkout the Stripe subscription plan.","title":"stripe_subscription_url","type":"string","examples":["stripe_subscription_url"]},"stripe_billing_url":{"deprecated":true,"description":"DEPRECATED. The URL for the user to manage the existing Stripe subscription plan. Get this from ManageApiSubscriptionResponse instead.","title":"stripe_billing_url","type":"string","examples":["stripe_billing_url"]}},"title":"ManageApiStripeSubscriptionResponse","type":"object","$schema":"http://json-schema.org/draft-04/schema#"}}} as const
;
const GetApiSubscription = {"response":{"200":{"properties":{"has_accepted_terms":{"description":"Whether or not the latest required terms have been accepted.","title":"has_accepted_terms","type":"boolean","examples":[true]},"has_stripe_setup":{"description":"Whether or not Stripe is setup for API usage.","title":"has_stripe_setup","type":"boolean","examples":[true]},"metronome_dashboard_url":{"description":"The URL to display the customer usage dashboard.","title":"metronome_dashboard_url","type":"string","examples":["metronome_dashboard_url"]},"metronome_dashboard_dark_mode_url":{"description":"The URL to display the customer usage dashboard, in dark mode.","title":"metronome_dashboard_dark_mode_url","type":"string","examples":["metronome_dashboard_dark_mode_url"]},"recharge_settings":{"description":"The current recharge settings for the API subscription.","properties":{"top_up_balance":{"description":"Represents a price.","properties":{"currency_code":{"description":"The ISO 4217 currency code for the price object.","title":"currency_code","type":"string","examples":["USD"]},"amount":{"description":"The amount of the currency in the common denomination. For example, in USD this is cents.","title":"amount","type":"number","examples":[1050]}},"title":"Price","type":"object"},"minimum_balance_threshold":{"description":"Represents a price.","properties":{"currency_code":{"description":"The ISO 4217 currency code for the price object.","title":"currency_code","type":"string","examples":["USD"]},"amount":{"description":"The amount of the currency in the common denomination. For example, in USD this is cents.","title":"amount","type":"number","examples":[1050]}},"title":"Price","type":"object"}},"required":["minimum_balance_threshold","top_up_balance"],"title":"RechargeSettings","type":"object"},"stripe_billing_url":{"description":"The URL for the user to manage the existing Stripe subscription plan.","title":"stripe_billing_url","type":"string","examples":["stripe_billing_url"]}},"required":["has_accepted_terms","has_stripe_setup"],"title":"ManageApiSubscriptionResponse","type":"object","$schema":"http://json-schema.org/draft-04/schema#"}}} as const
;
const GetApiTerms = {"response":{"200":{"properties":{"api_terms":{"properties":{"terms_id":{"description":"The ID of the terms.","title":"terms_id","type":"string","examples":["terms_id"]},"terms_url":{"description":"The URL where the terms are hosted.","title":"terms_url","type":"string","examples":["terms_url"]}},"required":["terms_id","terms_url"],"title":"ApiTerms","type":"object"}},"required":["api_terms"],"title":"GetApiTermsResponse","type":"object","$schema":"http://json-schema.org/draft-04/schema#"}}} as const
;
const PostApiSubscription = {"body":{"description":"Request to update API settings. Fields which are omitted will be ignored.","properties":{"recharge_settings":{"description":"The current recharge settings for the API subscription.","properties":{"top_up_balance":{"description":"Represents a price.","properties":{"currency_code":{"description":"The ISO 4217 currency code for the price object.","title":"currency_code","type":"string","examples":["USD"]},"amount":{"description":"The amount of the currency in the common denomination. For example, in USD this is cents.","title":"amount","type":"number","examples":[1050]}},"title":"Price","type":"object"},"minimum_balance_threshold":{"description":"Represents a price.","properties":{"currency_code":{"description":"The ISO 4217 currency code for the price object.","title":"currency_code","type":"string","examples":["USD"]},"amount":{"description":"The amount of the currency in the common denomination. For example, in USD this is cents.","title":"amount","type":"number","examples":[1050]}},"title":"Price","type":"object"}},"required":["minimum_balance_threshold","top_up_balance"],"title":"RechargeSettings","type":"object"}},"title":"PostApiSubscriptionRequest","type":"object","$schema":"http://json-schema.org/draft-04/schema#"},"response":{"200":{"description":"The updated API subscription.","properties":{"recharge_settings":{"description":"The current recharge settings for the API subscription.","properties":{"top_up_balance":{"description":"Represents a price.","properties":{"currency_code":{"description":"The ISO 4217 currency code for the price object.","title":"currency_code","type":"string","examples":["USD"]},"amount":{"description":"The amount of the currency in the common denomination. For example, in USD this is cents.","title":"amount","type":"number","examples":[1050]}},"title":"Price","type":"object"},"minimum_balance_threshold":{"description":"Represents a price.","properties":{"currency_code":{"description":"The ISO 4217 currency code for the price object.","title":"currency_code","type":"string","examples":["USD"]},"amount":{"description":"The amount of the currency in the common denomination. For example, in USD this is cents.","title":"amount","type":"number","examples":[1050]}},"title":"Price","type":"object"}},"required":["minimum_balance_threshold","top_up_balance"],"title":"RechargeSettings","type":"object"}},"title":"PostApiSubscriptionResponse","type":"object","$schema":"http://json-schema.org/draft-04/schema#"},"400":{"description":"Represents an error when attempting to update the API subscription.","properties":{"messages":{"description":"Error messages about what the error could be.","items":{"description":"An error message, indicating what went wrong.","type":"string","examples":["messages"]},"title":"messages","type":"array"}},"title":"PostApiSubscriptionError","type":"object","$schema":"http://json-schema.org/draft-04/schema#"}}} as const
;
const PostApiTerms = {"body":{"properties":{"terms_id":{"description":"The ID of the terms which are being accepted.","title":"terms_id","type":"string","examples":["TOS_2024_04_20"]}},"required":["terms_id"],"title":"PostApiTermsRequest","type":"object","$schema":"http://json-schema.org/draft-04/schema#"}} as const
;
const PostDescribe = {"body":{"description":"An image binary; only JPEG, WEBPs and PNGs are supported at this time","properties":{"image_file":{"format":"binary","type":"string"}},"type":"object","$schema":"http://json-schema.org/draft-04/schema#"},"response":{"200":{"description":"The response for a describe request encapsulates a list of descriptions","properties":{"descriptions":{"description":"A collection of descriptions for given content","items":{"properties":{"text":{"description":"The generated description for the provided image.","title":"text","type":"string","examples":["A meticulously illustrated cat with striped patterns, sitting upright. The cat's eyes are a captivating shade of yellow, and it appears to be gazing intently at something. The background consists of abstract, swirling patterns in shades of black, white, and beige, creating an almost fluid or wavy appearance. The cat is positioned in the foreground, with the background elements fading into the distance, giving a sense of depth to the image."]}},"title":"Description","type":"object"},"title":"descriptions","type":"array"}},"title":"DescribeResponse","type":"object","$schema":"http://json-schema.org/draft-04/schema#"},"422":{"properties":{"error":{"title":"error","type":"string","examples":["Image provided failed safety check due to the inclusion of prohibited content."]}},"required":["error"],"title":"ImageSafetyError","type":"object","$schema":"http://json-schema.org/draft-04/schema#"}}} as const
;
const PostGenerateImage = {"body":{"properties":{"image_request":{"properties":{"prompt":{"description":"The prompt to use to generate the image.","type":"string","examples":["A serene tropical beach scene. Dominating the foreground are tall palm trees with lush green leaves, standing tall against a backdrop of a sandy beach. The beach leads to the azure waters of the sea, which gently kisses the shoreline. In the distance, there is an island or landmass with a silhouette of what appears to be a lighthouse or tower. The sky above is painted with fluffy white clouds, some of which are tinged with hues of pink and orange, suggesting either a sunrise or sunset."]},"aspect_ratio":{"description":"(Cannot be used in conjunction with resolution) The aspect ratio to use for image generation, which determines the image's resolution. Defaults to ASPECT_1_1.","enum":["ASPECT_10_16","ASPECT_16_10","ASPECT_9_16","ASPECT_16_9","ASPECT_3_2","ASPECT_2_3","ASPECT_4_3","ASPECT_3_4","ASPECT_1_1","ASPECT_1_3","ASPECT_3_1"],"title":"AspectRatio","type":"string","examples":["ASPECT_10_16"]},"model":{"default":"V_2","description":"The model used to generate. Defaults to V_2.\n\nDefault: `V_2`","enum":["V_1","V_1_TURBO","V_2","V_2_TURBO"],"title":"ModelEnum","type":"string","examples":["V_1_TURBO"]},"magic_prompt_option":{"default":"AUTO","description":"Determine if MagicPrompt should be used in generating the request or not\n\nDefault: `AUTO`","enum":["AUTO","ON","OFF"],"title":"MagicPromptOption","type":"string","examples":["ON"]},"seed":{"maximum":2147483647,"minimum":0,"title":"Seed","type":"integer","examples":[12345]},"style_type":{"description":"The style type to generate with; this is only applicable for models V_2 and above and should not be specified for model versions V_1.","enum":["GENERAL","REALISTIC","DESIGN","RENDER_3D","ANIME"],"title":"StyleType","type":"string","examples":["REALISTIC"]},"negative_prompt":{"description":"Description of what to exclude from an image. Descriptions in the prompt take precedence to descriptions in the negative prompt.","type":"string","examples":["brush strokes, painting"]},"resolution":{"description":"(For model_version for 2.0 only, cannot be used in conjunction with aspect_ratio) The resolution to use for image generation, represented in width x height. If not specified, defaults to using aspect_ratio.","enum":["RESOLUTION_512_1536","RESOLUTION_576_1408","RESOLUTION_576_1472","RESOLUTION_576_1536","RESOLUTION_640_1024","RESOLUTION_640_1344","RESOLUTION_640_1408","RESOLUTION_640_1472","RESOLUTION_640_1536","RESOLUTION_704_1152","RESOLUTION_704_1216","RESOLUTION_704_1280","RESOLUTION_704_1344","RESOLUTION_704_1408","RESOLUTION_704_1472","RESOLUTION_720_1280","RESOLUTION_736_1312","RESOLUTION_768_1024","RESOLUTION_768_1088","RESOLUTION_768_1152","RESOLUTION_768_1216","RESOLUTION_768_1232","RESOLUTION_768_1280","RESOLUTION_768_1344","RESOLUTION_832_960","RESOLUTION_832_1024","RESOLUTION_832_1088","RESOLUTION_832_1152","RESOLUTION_832_1216","RESOLUTION_832_1248","RESOLUTION_864_1152","RESOLUTION_896_960","RESOLUTION_896_1024","RESOLUTION_896_1088","RESOLUTION_896_1120","RESOLUTION_896_1152","RESOLUTION_960_832","RESOLUTION_960_896","RESOLUTION_960_1024","RESOLUTION_960_1088","RESOLUTION_1024_640","RESOLUTION_1024_768","RESOLUTION_1024_832","RESOLUTION_1024_896","RESOLUTION_1024_960","RESOLUTION_1024_1024","RESOLUTION_1088_768","RESOLUTION_1088_832","RESOLUTION_1088_896","RESOLUTION_1088_960","RESOLUTION_1120_896","RESOLUTION_1152_704","RESOLUTION_1152_768","RESOLUTION_1152_832","RESOLUTION_1152_864","RESOLUTION_1152_896","RESOLUTION_1216_704","RESOLUTION_1216_768","RESOLUTION_1216_832","RESOLUTION_1232_768","RESOLUTION_1248_832","RESOLUTION_1280_704","RESOLUTION_1280_720","RESOLUTION_1280_768","RESOLUTION_1280_800","RESOLUTION_1312_736","RESOLUTION_1344_640","RESOLUTION_1344_704","RESOLUTION_1344_768","RESOLUTION_1408_576","RESOLUTION_1408_640","RESOLUTION_1408_704","RESOLUTION_1472_576","RESOLUTION_1472_640","RESOLUTION_1472_704","RESOLUTION_1536_512","RESOLUTION_1536_576","RESOLUTION_1536_640"],"title":"Resolution","type":"string","examples":["RESOLUTION_1024_1024"]}},"required":["prompt"],"title":"ImageRequest","type":"object"}},"required":["image_request"],"title":"GenerateImageRequest","type":"object","$schema":"http://json-schema.org/draft-04/schema#"},"response":{"200":{"properties":{"created":{"description":"The time the request was created.","format":"date-time","title":"created","type":"string","examples":["2000-01-23T04:56:07.000Z"]},"data":{"description":"A list of ImageObjects that contain the generated image(s).","items":{"properties":{"url":{"description":"The direct link to the image generated.","format":"uri","title":"url","type":["string","null"],"examples":["https://ideogram.ai/api/images/direct/8YEpFzHuS-S6xXEGmCsf7g"]},"prompt":{"description":"The prompt used for the generation. This may be different from the original prompt.","title":"prompt","type":"string","examples":["A serene tropical beach scene. Dominating the foreground are tall palm trees with lush green leaves, standing tall against a backdrop of a sandy beach. The beach leads to the azure waters of the sea, which gently kisses the shoreline. In the distance, there's an island or landmass with a silhouette of what appears to be a lighthouse or tower. The sky above is painted with fluffy white clouds, some of which are tinged with hues of pink and orange, suggesting either a sunrise or sunset."]},"resolution":{"description":"The resolution of the final image.","title":"resolution","type":"string","examples":["1024x1024"]},"is_image_safe":{"description":"Whether this request passes safety checks. If false, the url field will be empty.","title":"is_image_safe","type":"boolean","examples":[true]},"seed":{"maximum":2147483647,"minimum":0,"title":"Seed","type":"integer","examples":[12345]}},"required":["is_image_safe","prompt","resolution","seed"],"title":"ImageObject","type":"object"},"title":"data","type":"array"}},"required":["created","data"],"title":"GenerateImageResponse","type":"object","$schema":"http://json-schema.org/draft-04/schema#"},"422":{"properties":{"error":{"title":"error","type":"string","examples":["Prompt provided failed safety check due to the inclusion of prohibited content."]}},"required":["error"],"title":"GenerateImageSafetyError","type":"object","$schema":"http://json-schema.org/draft-04/schema#"}}} as const
;
const PostRemixImage = {"body":{"description":"A request to generate an image from a source image and a provided caption, provided images are cropped to match the chosen output aspect ratio","properties":{"image_request":{"description":"A request to generate a new image using a provided image and a prompt.","title":"InitialImageRequest","type":"object","required":["prompt"],"properties":{"image_weight":{"default":50,"maximum":100,"minimum":1,"type":"integer","examples":[50]},"prompt":{"description":"The prompt to use to generate the image.","type":"string","examples":["A serene tropical beach scene. Dominating the foreground are tall palm trees with lush green leaves, standing tall against a backdrop of a sandy beach. The beach leads to the azure waters of the sea, which gently kisses the shoreline. In the distance, there is an island or landmass with a silhouette of what appears to be a lighthouse or tower. The sky above is painted with fluffy white clouds, some of which are tinged with hues of pink and orange, suggesting either a sunrise or sunset."]},"aspect_ratio":{"description":"(Cannot be used in conjunction with resolution) The aspect ratio to use for image generation, which determines the image's resolution. Defaults to ASPECT_1_1.","enum":["ASPECT_10_16","ASPECT_16_10","ASPECT_9_16","ASPECT_16_9","ASPECT_3_2","ASPECT_2_3","ASPECT_4_3","ASPECT_3_4","ASPECT_1_1","ASPECT_1_3","ASPECT_3_1"],"title":"AspectRatio","type":"string","examples":["ASPECT_10_16"]},"model":{"default":"V_2","description":"The model used to generate. Defaults to V_2.\n\nDefault: `V_2`","enum":["V_1","V_1_TURBO","V_2","V_2_TURBO"],"title":"ModelEnum","type":"string","examples":["V_1_TURBO"]},"magic_prompt_option":{"default":"AUTO","description":"Determine if MagicPrompt should be used in generating the request or not\n\nDefault: `AUTO`","enum":["AUTO","ON","OFF"],"title":"MagicPromptOption","type":"string","examples":["ON"]},"seed":{"maximum":2147483647,"minimum":0,"title":"Seed","type":"integer","examples":[12345]},"style_type":{"description":"The style type to generate with; this is only applicable for models V_2 and above and should not be specified for model versions V_1.","enum":["GENERAL","REALISTIC","DESIGN","RENDER_3D","ANIME"],"title":"StyleType","type":"string","examples":["REALISTIC"]},"negative_prompt":{"description":"Description of what to exclude from an image. Descriptions in the prompt take precedence to descriptions in the negative prompt.","type":"string","examples":["brush strokes, painting"]},"resolution":{"description":"(For model_version for 2.0 only, cannot be used in conjunction with aspect_ratio) The resolution to use for image generation, represented in width x height. If not specified, defaults to using aspect_ratio.","enum":["RESOLUTION_512_1536","RESOLUTION_576_1408","RESOLUTION_576_1472","RESOLUTION_576_1536","RESOLUTION_640_1024","RESOLUTION_640_1344","RESOLUTION_640_1408","RESOLUTION_640_1472","RESOLUTION_640_1536","RESOLUTION_704_1152","RESOLUTION_704_1216","RESOLUTION_704_1280","RESOLUTION_704_1344","RESOLUTION_704_1408","RESOLUTION_704_1472","RESOLUTION_720_1280","RESOLUTION_736_1312","RESOLUTION_768_1024","RESOLUTION_768_1088","RESOLUTION_768_1152","RESOLUTION_768_1216","RESOLUTION_768_1232","RESOLUTION_768_1280","RESOLUTION_768_1344","RESOLUTION_832_960","RESOLUTION_832_1024","RESOLUTION_832_1088","RESOLUTION_832_1152","RESOLUTION_832_1216","RESOLUTION_832_1248","RESOLUTION_864_1152","RESOLUTION_896_960","RESOLUTION_896_1024","RESOLUTION_896_1088","RESOLUTION_896_1120","RESOLUTION_896_1152","RESOLUTION_960_832","RESOLUTION_960_896","RESOLUTION_960_1024","RESOLUTION_960_1088","RESOLUTION_1024_640","RESOLUTION_1024_768","RESOLUTION_1024_832","RESOLUTION_1024_896","RESOLUTION_1024_960","RESOLUTION_1024_1024","RESOLUTION_1088_768","RESOLUTION_1088_832","RESOLUTION_1088_896","RESOLUTION_1088_960","RESOLUTION_1120_896","RESOLUTION_1152_704","RESOLUTION_1152_768","RESOLUTION_1152_832","RESOLUTION_1152_864","RESOLUTION_1152_896","RESOLUTION_1216_704","RESOLUTION_1216_768","RESOLUTION_1216_832","RESOLUTION_1232_768","RESOLUTION_1248_832","RESOLUTION_1280_704","RESOLUTION_1280_720","RESOLUTION_1280_768","RESOLUTION_1280_800","RESOLUTION_1312_736","RESOLUTION_1344_640","RESOLUTION_1344_704","RESOLUTION_1344_768","RESOLUTION_1408_576","RESOLUTION_1408_640","RESOLUTION_1408_704","RESOLUTION_1472_576","RESOLUTION_1472_640","RESOLUTION_1472_704","RESOLUTION_1536_512","RESOLUTION_1536_576","RESOLUTION_1536_640"],"title":"Resolution","type":"string","examples":["RESOLUTION_1024_1024"]}}},"image_file":{"description":"An image binary; only JPEG, WEBPs and PNGs are supported at this time","format":"binary","type":"string"}},"required":["image_file","image_request"],"type":"object","$schema":"http://json-schema.org/draft-04/schema#"},"response":{"200":{"properties":{"created":{"description":"The time the request was created.","format":"date-time","title":"created","type":"string","examples":["2000-01-23T04:56:07.000Z"]},"data":{"description":"A list of ImageObjects that contain the generated image(s).","items":{"properties":{"url":{"description":"The direct link to the image generated.","format":"uri","title":"url","type":["string","null"],"examples":["https://ideogram.ai/api/images/direct/8YEpFzHuS-S6xXEGmCsf7g"]},"prompt":{"description":"The prompt used for the generation. This may be different from the original prompt.","title":"prompt","type":"string","examples":["A serene tropical beach scene. Dominating the foreground are tall palm trees with lush green leaves, standing tall against a backdrop of a sandy beach. The beach leads to the azure waters of the sea, which gently kisses the shoreline. In the distance, there's an island or landmass with a silhouette of what appears to be a lighthouse or tower. The sky above is painted with fluffy white clouds, some of which are tinged with hues of pink and orange, suggesting either a sunrise or sunset."]},"resolution":{"description":"The resolution of the final image.","title":"resolution","type":"string","examples":["1024x1024"]},"is_image_safe":{"description":"Whether this request passes safety checks. If false, the url field will be empty.","title":"is_image_safe","type":"boolean","examples":[true]},"seed":{"maximum":2147483647,"minimum":0,"title":"Seed","type":"integer","examples":[12345]}},"required":["is_image_safe","prompt","resolution","seed"],"title":"ImageObject","type":"object"},"title":"data","type":"array"}},"required":["created","data"],"title":"GenerateImageResponse","type":"object","$schema":"http://json-schema.org/draft-04/schema#"},"422":{"properties":{"error":{"title":"error","type":"string","examples":["Prompt provided failed safety check due to the inclusion of prohibited content."]}},"required":["error"],"title":"GenerateImageSafetyError","type":"object","$schema":"http://json-schema.org/draft-04/schema#"}}} as const
;
const PostUpscaleImage = {"body":{"properties":{"image_request":{"description":"A request to upscale a provided image with the help of an optional prompt.","properties":{"prompt":{"description":"An optional prompt to guide the upscale","title":"prompt","type":"string","examples":["A serene tropical beach scene. Dominating the foreground are tall palm trees with lush green leaves, standing tall against a backdrop of a sandy beach. The beach leads to the azure waters of the sea, which gently kisses the shoreline. In the distance, there is an island or landmass with a silhouette of what appears to be a lighthouse or tower. The sky above is painted with fluffy white clouds, some of which are tinged with hues of pink and orange, suggesting either a sunrise or sunset."]},"resemblance":{"default":50,"maximum":100,"minimum":1,"title":"resemblance","type":"integer","examples":[50]},"detail":{"default":50,"maximum":100,"minimum":1,"title":"detail","type":"integer","examples":[50]},"magic_prompt_option":{"default":"AUTO","description":"Determine if MagicPrompt should be used in generating the request or not\n\nDefault: `AUTO`","enum":["AUTO","ON","OFF"],"title":"MagicPromptOption","type":"string","examples":["ON"]},"seed":{"maximum":2147483647,"minimum":0,"title":"Seed","type":"integer","examples":[12345]}},"title":"UpscaleInitialImageRequest","type":"object"},"image_file":{"description":"An image binary; only JPEG, WEBPs and PNGs are supported at this time","format":"binary","type":"string"}},"required":["image_file","image_request"],"type":"object","$schema":"http://json-schema.org/draft-04/schema#"},"response":{"200":{"properties":{"created":{"description":"The time the request was created.","format":"date-time","title":"created","type":"string","examples":["2000-01-23T04:56:07.000Z"]},"data":{"description":"A list of ImageObjects that contain the generated image(s).","items":{"properties":{"url":{"description":"The direct link to the image generated.","format":"uri","title":"url","type":["string","null"],"examples":["https://ideogram.ai/api/images/direct/8YEpFzHuS-S6xXEGmCsf7g"]},"prompt":{"description":"The prompt used for the generation. This may be different from the original prompt.","title":"prompt","type":"string","examples":["A serene tropical beach scene. Dominating the foreground are tall palm trees with lush green leaves, standing tall against a backdrop of a sandy beach. The beach leads to the azure waters of the sea, which gently kisses the shoreline. In the distance, there's an island or landmass with a silhouette of what appears to be a lighthouse or tower. The sky above is painted with fluffy white clouds, some of which are tinged with hues of pink and orange, suggesting either a sunrise or sunset."]},"resolution":{"description":"The resolution of the final image.","title":"resolution","type":"string","examples":["1024x1024"]},"is_image_safe":{"description":"Whether this request passes safety checks. If false, the url field will be empty.","title":"is_image_safe","type":"boolean","examples":[true]},"seed":{"maximum":2147483647,"minimum":0,"title":"Seed","type":"integer","examples":[12345]}},"required":["is_image_safe","prompt","resolution","seed"],"title":"ImageObject","type":"object"},"title":"data","type":"array"}},"required":["created","data"],"title":"GenerateImageResponse","type":"object","$schema":"http://json-schema.org/draft-04/schema#"},"422":{"properties":{"error":{"title":"error","type":"string","examples":["Prompt provided failed safety check due to the inclusion of prohibited content."]}},"required":["error"],"title":"GenerateImageSafetyError","type":"object","$schema":"http://json-schema.org/draft-04/schema#"}}} as const
;
export { CreateApiKey, DeleteSingleApiKey, GetApiKeys, GetApiStripeSubscription, GetApiSubscription, GetApiTerms, PostApiSubscription, PostApiTerms, PostDescribe, PostGenerateImage, PostRemixImage, PostUpscaleImage }