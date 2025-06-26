# Changelog

# [1.11.0-rc.0](https://github.com/presidio-oss/hai-guardrails/compare/v1.10.1-rc.2...v1.11.0-rc.0) (2025-06-26)


### Bug Fixes

* Removed pino type which is included default in pino and pino-pretty moved to dev dependencies which is not required in production env to avoid memory and cpu utilization ([#46](https://github.com/presidio-oss/hai-guardrails/issues/46)) ([d14f985](https://github.com/presidio-oss/hai-guardrails/commit/d14f985e114529180d6a9b45bf6ac1aee97b3c79))


### Features

* Heuristic tactics to be validated using workers for high performance ([#64](https://github.com/presidio-oss/hai-guardrails/issues/64)) ([bafcf63](https://github.com/presidio-oss/hai-guardrails/commit/bafcf63e21bdb871863480ffd236a985fb2bb246))

## [1.10.1-rc.2](https://github.com/presidio-oss/hai-guardrails/compare/v1.10.0...v1.10.1-rc.2) (2025-06-10)

# [1.10.0](https://github.com/presidio-oss/hai-guardrails/compare/v1.10.0-rc.3...v1.10.0) (2025-05-22)

# [1.10.0-rc.3](https://github.com/presidio-oss/hai-guardrails/compare/v1.10.0-rc.2...v1.10.0-rc.3) (2025-05-22)


### Bug Fixes

* **build:** exclude pino from bundle and optimize build config ([#33](https://github.com/presidio-oss/hai-guardrails/issues/33)) ([67e9679](https://github.com/presidio-oss/hai-guardrails/commit/67e9679898aae7802bf83655fe31775147b35630))

# [1.10.0-rc.2](https://github.com/presidio-oss/hai-guardrails/compare/v1.10.0-rc.1...v1.10.0-rc.2) (2025-05-22)


### Features

* **exports:** add new guard exports to public API ([#31](https://github.com/presidio-oss/hai-guardrails/issues/31)) ([aadf3c5](https://github.com/presidio-oss/hai-guardrails/commit/aadf3c5c333774e4e65d8f4dabd3d26a199a59c0))

# [1.10.0-rc.1](https://github.com/presidio-oss/hai-guardrails/compare/v1.10.0-rc.0...v1.10.0-rc.1) (2025-05-22)


### Features

* **guards:** implement content moderation guards and examples ([#29](https://github.com/presidio-oss/hai-guardrails/issues/29)) ([3bb78a8](https://github.com/presidio-oss/hai-guardrails/commit/3bb78a873e437500e4663af327df9c4fe353836e))
* **logging:** add structured logging with Pino integration ([#28](https://github.com/presidio-oss/hai-guardrails/issues/28)) ([ce572ed](https://github.com/presidio-oss/hai-guardrails/commit/ce572edf345e48876a4412cbbb385c9203b0cb76))

# [1.10.0-rc.0](https://github.com/presidio-oss/hai-guardrails/compare/v1.9.0...v1.10.0-rc.0) (2025-05-16)


### Bug Fixes

* enhance LangChain bridge with improved message handling ([#24](https://github.com/presidio-oss/hai-guardrails/issues/24)) ([b746cea](https://github.com/presidio-oss/hai-guardrails/commit/b746cea00b1764596f53f4799adc98a60bec8ad1))


### Features

* add message hashing and improve guard result structure ([38ac157](https://github.com/presidio-oss/hai-guardrails/commit/38ac157c1b71c993032f93088039bbfdf07998dc))

# [1.9.0](https://github.com/presidio-oss/hai-guardrails/compare/v1.8.0...v1.9.0) (2025-05-09)


### Features

* add 'block' mode to PII and Secret guards ([d5b26af](https://github.com/presidio-oss/hai-guardrails/commit/d5b26afdeec9aaf957c0173a4c2cc350c6dc76a6))
* rename make*Guard functions to *Guard ([d4adb48](https://github.com/presidio-oss/hai-guardrails/commit/d4adb48cb9466e22272094e172a745bb37c492e8))

# [1.8.0](https://github.com/presidio-oss/hai-guardrails/compare/v1.6.2...v1.8.0) (2025-05-08)


### Features

* rename make*Guard functions to *Guard ([c585c16](https://github.com/presidio-oss/hai-guardrails/commit/c585c16ff39fdb67ddeace60a5a3fa0579ce6b7a))

## [1.6.2](https://github.com/presidio-oss/hai-guardrails/compare/v1.6.1...v1.6.2) (2025-05-07)


### Bug Fixes

* refine message selection logic and add comprehensive tests ([af99315](https://github.com/presidio-oss/hai-guardrails/commit/af9931537be453557461aeb4ceb1b89ed406695c))
* refine message selection logic and add comprehensive tests ([cb1ab89](https://github.com/presidio-oss/hai-guardrails/commit/cb1ab891fd1bd3256d45361dbeda2e57631143d9))

## [1.6.1](https://github.com/presidio-oss/hai-guardrails/compare/v1.6.0...v1.6.1) (2025-05-07)

## 1.6.0 (2025-05-05)

* docs: add PII and Secret guard examples ([db1317b](https://github.com/presidio-oss/hai-guardrails/commit/db1317b))
* docs: update injection guard examples and add BYOP example ([fcbf68e](https://github.com/presidio-oss/hai-guardrails/commit/fcbf68e))
* docs: update README to reflect PII and Secret Guard implementation ([ae4ea81](https://github.com/presidio-oss/hai-guardrails/commit/ae4ea81))
* fix: export new guard modules and update existing guard module exports ([60c1fb2](https://github.com/presidio-oss/hai-guardrails/commit/60c1fb2))
* feat: implement Guardrails Engine and pii & secret guard ([7188f69](https://github.com/presidio-oss/hai-guardrails/commit/7188f69))
* feat: implement Guardrails Engine and pii & secret guard ([41f9873](https://github.com/presidio-oss/hai-guardrails/commit/41f9873))
* chore(deps-dev): bump @types/bun from 1.2.11 to 1.2.12 ([6559408](https://github.com/presidio-oss/hai-guardrails/commit/6559408))
* chore(deps-dev): bump release-it from 19.0.1 to 19.0.2 ([09e817c](https://github.com/presidio-oss/hai-guardrails/commit/09e817c))
* ci: update CI/CD workflow to trigger on release branch ([f82dda8](https://github.com/presidio-oss/hai-guardrails/commit/f82dda8))
* ci: update CI/CD workflow to trigger on release branch ([539c173](https://github.com/presidio-oss/hai-guardrails/commit/539c173))

## <small>1.5.6 (2025-05-02)</small>

* docs: add BYOP example and architecture diagram ([1549acb](https://github.com/presidio-oss/hai-guardrails/commit/1549acb))

## <small>1.5.5 (2025-05-02)</small>

* docs: add bias detection guard and rename package ([e5c81f8](https://github.com/presidio-oss/hai-guardrails/commit/e5c81f8))
* docs: add hallucination guard and update keywords ([d9a3f01](https://github.com/presidio-oss/hai-guardrails/commit/d9a3f01))

## <small>1.5.4 (2025-05-02)</small>

* chore: add issue templates and dependabot configuration ([5451e9e](https://github.com/presidio-oss/hai-guardrails/commit/5451e9e))

## <small>1.5.3 (2025-05-02)</small>

* docs: complete leakage and injection guards, add provider support ([73ca028](https://github.com/presidio-oss/hai-guardrails/commit/73ca028))

## <small>1.5.2 (2025-05-02)</small>

* docs: enhance project setup and contribution guidelines ([6e74616](https://github.com/presidio-oss/hai-guardrails/commit/6e74616))

## <small>1.5.1 (2025-05-02)</small>

* docs: add vision, overview, and roadmap to README ([f8fc089](https://github.com/presidio-oss/hai-guardrails/commit/f8fc089))
* docs: enhance README with usage examples and detection details ([c75a01a](https://github.com/presidio-oss/hai-guardrails/commit/c75a01a))

## 1.5.0 (2025-05-02)

* docs: enhance README with guard descriptions and installation instructions ([f7a5655](https://github.com/presidio-oss/hai-guardrails/commit/f7a5655))
* chore: prep release ([e6bcd29](https://github.com/presidio-oss/hai-guardrails/commit/e6bcd29))
* chore: release v1.1.0 [skip ci] ([4eec9aa](https://github.com/presidio-oss/hai-guardrails/commit/4eec9aa))
* chore: release v1.1.1 [skip ci] ([677bf4d](https://github.com/presidio-oss/hai-guardrails/commit/677bf4d))
* chore: release v1.2.0 [skip ci] ([c38d2b7](https://github.com/presidio-oss/hai-guardrails/commit/c38d2b7))
* chore: release v1.3.0 [skip ci] ([d41c351](https://github.com/presidio-oss/hai-guardrails/commit/d41c351))
* chore: release v1.3.1 [skip ci] ([95b856e](https://github.com/presidio-oss/hai-guardrails/commit/95b856e))
* chore: release v1.3.2 [skip ci] ([b2c3b41](https://github.com/presidio-oss/hai-guardrails/commit/b2c3b41))
* chore: release v1.4.0 [skip ci] ([715947a](https://github.com/presidio-oss/hai-guardrails/commit/715947a))
* chore: rename package to @vj-presidio/guards ([5208fa5](https://github.com/presidio-oss/hai-guardrails/commit/5208fa5))
* feat: allow function as LLM for language model tactic ([b56eb60](https://github.com/presidio-oss/hai-guardrails/commit/b56eb60))
* feat: allow function as LLM for language model tactic ([a6d2477](https://github.com/presidio-oss/hai-guardrails/commit/a6d2477))
* feat: injection and leakage guards ([812a20e](https://github.com/presidio-oss/hai-guardrails/commit/812a20e))
* feat: rename package to @presidio-dev/hai-guardrails ([bb8e742](https://github.com/presidio-oss/hai-guardrails/commit/bb8e742))
* fix: add .prettierignore to exclude CHANGELOG.md ([1dcc4df](https://github.com/presidio-oss/hai-guardrails/commit/1dcc4df))
* fix: simplify LLMMessages type definition ([c8e34cc](https://github.com/presidio-oss/hai-guardrails/commit/c8e34cc))
* fix: trim input in language model tactic ([c5474fb](https://github.com/presidio-oss/hai-guardrails/commit/c5474fb))
* fix: update .gitignore to exclude build artifacts ([d171fac](https://github.com/presidio-oss/hai-guardrails/commit/d171fac))

## 1.4.0 (2025-05-02)

* feat: rename package to @presidio-dev/hai-guardrails ([bb8e742](https://github.com/vj-presidio/guard/commit/bb8e742))

## <small>1.3.2 (2025-05-02)</small>

* fix: trim input in language model tactic ([c5474fb](https://github.com/vj-presidio/guard/commit/c5474fb))

## <small>1.3.1 (2025-05-02)</small>

* fix: simplify LLMMessages type definition ([c8e34cc](https://github.com/vj-presidio/guard/commit/c8e34cc))

## 1.3.0 (2025-05-02)

* feat: allow function as LLM for language model tactic ([b56eb60](https://github.com/vj-presidio/guard/commit/b56eb60))

## 1.2.0 (2025-05-02)

* feat: allow function as LLM for language model tactic ([a6d2477](https://github.com/vj-presidio/guard/commit/a6d2477))

## <small>1.1.1 (2025-04-30)</small>

* fix: add .prettierignore to exclude CHANGELOG.md ([1dcc4df](https://github.com/vj-presidio/guard/commit/1dcc4df))
* fix: update .gitignore to exclude build artifacts ([d171fac](https://github.com/vj-presidio/guard/commit/d171fac))

## 1.1.0 (2025-04-30)

* chore: prep release ([e6bcd29](https://github.com/vj-presidio/guard/commit/e6bcd29))
* chore: rename package to @vj-presidio/guards ([5208fa5](https://github.com/vj-presidio/guard/commit/5208fa5))
* feat: injection and leakage guards ([812a20e](https://github.com/vj-presidio/guard/commit/812a20e))
