import { text_en, type ApplicationText } from "@stricli/core";

export type AppLocale = "ko" | "en";

export interface UiText {
  readonly appDescription: string;
  readonly commandBriefs: {
    readonly runArgProfile: string;
    readonly run: string;
    readonly runFlagEnvCompat: string;
    readonly host: string;
    readonly hostFlagEnvCompat: string;
    readonly auth: string;
    readonly authAddArgProfile: string;
    readonly authAdd: string;
    readonly authAddFlagProvider: string;
    readonly authAddFlagFrom: string;
    readonly authList: string;
    readonly authRemoveArgProfile: string;
    readonly authRemove: string;
    readonly config: string;
    readonly configGetFlagProfile: string;
    readonly configGet: string;
    readonly configSetFlagProfile: string;
    readonly configSetArgAssignment: string;
    readonly configSet: string;
    readonly doctor: string;
    readonly isolate: string;
    readonly isolateArgProfile: string;
    readonly isolateFlagYes: string;
    readonly isolateFlagClean: string;
    readonly isolateFlagImportLatestHostSession: string;
    readonly isolateStatus: string;
    readonly isolateRemove: string;
    readonly isolateFreshArg: string;
    readonly isolateFresh: string;
    readonly ui: string;
    readonly uiFlagRich: string;
    readonly showcaseArgTopic: string;
    readonly showcase: string;
  };
  readonly rootHelp: {
    readonly badge: string;
    readonly summary: string;
    readonly quickStartTitle: string;
    readonly quickStartBadge: string;
    readonly quickStartAuthAdd: string;
    readonly quickStartLaunch: string;
    readonly quickStartContinue: string;
    readonly quickStartHost: string;
    readonly quickStartShowcase: string;
    readonly commandSurfaceTitle: string;
    readonly commandSurfaceProfile: string;
    readonly commandSurfaceHost: string;
    readonly commandSurfaceConfig: string;
    readonly commandSurfaceDoctor: string;
    readonly commandSurfaceIsolate: string;
    readonly commandSurfaceUi: string;
    readonly commandSurfaceShowcase: string;
    readonly localAliasBadge: string;
    readonly localAliasSummary: string;
    readonly launchSyntaxTitle: string;
    readonly launchSyntaxSummary: string;
    readonly launchSyntaxEasy: string;
    readonly launchSyntaxAdvanced: string;
    readonly launchSyntaxAdvancedDescription: string;
    readonly permissionScrubTitle: string;
    readonly permissionScrubBadge: string;
    readonly permissionScrubSummary: string;
    readonly permissionScrubCompatDescription: string;
    readonly permissionScrubPersistDescription: string;
  };
  readonly prompts: {
    readonly pickProfile: string;
    readonly hostHint: string;
    readonly overlayHint: string;
    readonly launchCancelled: string;
    readonly pasteToken: (profileId: string) => string;
    readonly tokenRequired: string;
    readonly tokenCancelled: string;
    readonly confirmRemove: (profileId: string) => string;
    readonly removeCancelled: string;
    readonly confirmIsolateRemove: (profileId: string) => string;
    readonly isolateRemoveCancelled: string;
    readonly permissionOverride: (profileId: string) => string;
    readonly permissionOverrideCompatLabel: string;
    readonly permissionOverrideCompatHint: string;
    readonly permissionOverrideSafeLabel: string;
    readonly permissionOverrideSafeHint: string;
    readonly permissionOverrideGuideLabel: string;
    readonly permissionOverrideGuideHint: string;
    readonly isolateBootstrap: (profileId: string) => string;
    readonly isolateBootstrapImportLabel: string;
    readonly isolateBootstrapImportHint: string;
    readonly isolateBootstrapCleanLabel: string;
    readonly isolateBootstrapCleanHint: string;
    readonly isolateBootstrapCancelled: string;
    readonly isolateContinuity: (profileId: string) => string;
    readonly isolateContinuityImportLabel: string;
    readonly isolateContinuityImportHint: string;
    readonly isolateContinuitySkipLabel: string;
    readonly isolateContinuitySkipHint: string;
    readonly isolateContinuityCancelled: string;
    readonly providerBaseUrl: (profileId: string) => string;
    readonly providerBaseUrlRequired: string;
    readonly providerBaseUrlCancelled: string;
    readonly confirmModelMappings: (summary: string) => string;
    readonly confirmModelMappingsCancelled: string;
  };
  readonly authAdd: {
    readonly introTitle: string;
    readonly introLine1: string;
    readonly introLine2: string;
    readonly nextTitle: string;
    readonly nextSetupToken: string;
    readonly nextSetupTokenDescription: string;
    readonly nextPasteToken: (profileId: string) => string;
    readonly nextPasteTokenDescription: string;
    readonly successTitle: string;
    readonly successRuntimePolicy: (modeLabel: string) => string;
    readonly successEnvProtectionNote: string;
    readonly successLaunch: (profileId: string) => string;
    readonly successLaunchDescription: string;
    readonly successContinue: (profileId: string) => string;
    readonly successContinueDescription: string;
    readonly successList: string;
    readonly successListDescription: string;
    readonly successConfigGet: (profileId: string) => string;
    readonly successConfigGetDescription: string;
    readonly successEditProfiles: string;
    readonly providerIntroTitle: string;
    readonly providerIntroLine1: string;
    readonly providerIntroLine2: string;
    readonly providerNextBaseUrl: string;
    readonly providerNextBaseUrlDescription: string;
    readonly providerNextToken: (profileId: string) => string;
    readonly providerNextTokenDescription: string;
    readonly providerFromFileNotice: (path: string) => string;
    readonly providerProbeSuccess: (count: number) => string;
    readonly providerProbeAuthWarn: string;
    readonly providerProbeUnavailableWarn: string;
    readonly providerMappingsApplied: (keys: string) => string;
    readonly providerMappingsSkipped: string;
    readonly providerDroppedKeysSummary: (keys: string) => string;
    readonly providerNotice: (notice: string) => string;
    readonly providerSuccessTitle: string;
    readonly providerSuccessBaseUrl: (baseUrl: string) => string;
  };
  readonly config: {
    readonly getTitle: string;
    readonly setSuccessTitle: string;
    readonly setSuccessSummary: (modeLabel: string) => string;
  };
  readonly profiles: {
    readonly title: string;
    readonly overlayCount: (count: number) => string;
    readonly introLine1: string;
    readonly introLine2: string;
    readonly inventoryTitle: string;
    readonly nextStepTitle: string;
    readonly createOverlayBadge: string;
    readonly noOverlay: string;
    readonly createOverlayDescription: string;
    readonly launchAfterSaveDescription: string;
    readonly editProfilesDescription: string;
    readonly readyBadge: (count: number) => string;
    readonly nextBulletLaunch: string;
    readonly nextBulletHost: string;
    readonly nextBulletConfig: string;
    readonly nextBulletRemove: string;
    readonly nextBulletEditProfiles: (profilesFile: string) => string;
    readonly nextBulletProfilesStored: string;
    readonly hostBadge: string;
    readonly overlayBadge: string;
    readonly hostLoginBadge: string;
    readonly storedBadge: string;
    readonly missingBadge: string;
    readonly lastUsedPrefix: string;
  };
  readonly doctor: {
    readonly title: string;
    readonly readyBadge: string;
    readonly checkEnvBadge: string;
    readonly readyLine1: string;
    readonly readyLine2: string;
    readonly conflictLine1: string;
    readonly conflictLine2: string;
    readonly snapshotTitle: string;
    readonly suggestedNextStepTitle: string;
    readonly suggestedCleanupTitle: string;
    readonly launchDescription: string;
    readonly hostContinueDescription: string;
    readonly cleanup1: string;
    readonly cleanup2: string;
    readonly cleanup3: string;
    readonly defaultHostConfig: string;
    readonly launchMode: string;
    readonly noneDetected: string;
    readonly shellScrubLabel: string;
    readonly shellScrubInherit: string;
    readonly shellScrubCompat: string;
    readonly shellScrubSafe: string;
    readonly providerProfilesLabel: string;
    readonly providerProfilesSummary: (count: number) => string;
    readonly providerAuthEnvConflictNote: string;
  };
  readonly permissionMode: {
    readonly safeMode: string;
    readonly compatMode: string;
    readonly warningTitle: string;
    readonly warningLine1: string;
    readonly warningLine2: string;
    readonly choicesTitle: string;
    readonly choiceCompat: string;
    readonly choiceSafe: string;
    readonly choiceGuide: string;
    readonly launchPolicyTitle: string;
    readonly compatLine1: string;
    readonly compatLine2: string;
    readonly safeLine1: string;
    readonly safeLine2: string;
    readonly guidanceTitle: string;
    readonly guidanceLine1: string;
    readonly guidanceLine2: string;
    readonly guidanceNextTitle: string;
    readonly guidanceCompatDescription: string;
    readonly guidanceSafeDescription: string;
    readonly guidancePersistDescription: string;
  };
  readonly controlPanel: {
    readonly title: string;
    readonly actionPrompt: string;
    readonly actionRun: string;
    readonly actionRunHint: string;
    readonly actionContinue: string;
    readonly actionContinueHint: string;
    readonly actionHost: string;
    readonly actionHostHint: string;
    readonly actionExplain: string;
    readonly actionExplainHint: string;
    readonly actionDoctor: string;
    readonly actionDoctorHint: string;
    readonly actionStatus: string;
    readonly actionStatusHint: string;
    readonly actionFresh: string;
    readonly actionFreshHint: string;
    readonly actionClean: string;
    readonly actionCleanHint: string;
    readonly actionQuit: string;
    readonly richGroupLaunch: string;
    readonly richGroupInspect: string;
    readonly richGroupDanger: string;
    readonly richGroupSystem: string;
    readonly richChipActive: string;
    readonly richChipAuth: string;
    readonly richChipIsolate: string;
    readonly richChipLinks: string;
    readonly richChipSession: string;
    readonly richCardIdentity: string;
    readonly richCardRuntime: string;
    readonly richCardContinuity: string;
    readonly richTopologyTitle: string;
    readonly liveSummary: string;
    readonly keyHelp: string;
    readonly compactKeyHelp: string;
    readonly stableModeBadge: string;
    readonly richModeBadge: string;
    readonly profileColumnTitle: string;
    readonly actionColumnTitle: string;
    readonly detailColumnTitle: string;
    readonly explainColumnTitle: string;
    readonly confirmColumnTitle: string;
    readonly helpColumnTitle: string;
    readonly stableModeSummary: string;
    readonly richModeSummary: string;
    readonly hostProfileBadge: string;
    readonly hostClaudeHome: string;
    readonly hostConfigSummary: string;
    readonly cleanConfigSummary: string;
    readonly hostLinkedConfigSummary: string;
    readonly hostSessionSummary: string;
    readonly sessionLinkedSummary: string;
    readonly sessionPendingSummary: string;
    readonly hostLinksOk: (ready: number, total: number) => string;
    readonly hostLinksPartial: (ready: number, total: number) => string;
    readonly hostLinkLinked: string;
    readonly hostLinkPresent: string;
    readonly hostLinkMissingSource: string;
    readonly hostLinkMissingTarget: string;
    readonly explainProfileAuth: string;
    readonly explainHostAuth: string;
    readonly explainIsolateHome: (homeDir: string) => string;
    readonly explainHostHome: string;
    readonly explainSessionLink: (cwd: string) => string;
    readonly explainHostSession: string;
    readonly noFilterResults: string;
    readonly confirmFreshSummary: (profileId: string) => string;
    readonly confirmCleanSummary: (profileId: string) => string;
    readonly confirmWarning: string;
    readonly confirmDefault: string;
    readonly confirmCancel: string;
    readonly confirmProceed: string;
    readonly confirmCompactKeyHelp: string;
    readonly overlayActionDisabled: string;
    readonly pickProfile: string;
    readonly pickSavedProfile: string;
    readonly noSavedProfiles: string;
    readonly notInteractive: string;
    readonly cancelled: string;
    readonly returning: string;
  };
  readonly errors: {
    readonly problemTitle: string;
    readonly nextStepTitle: string;
    readonly unknownProfileTitle: (profileId: string) => string;
    readonly unknownProfileSummary: string;
    readonly createOverlayDescription: string;
    readonly inspectProfilesDescription: string;
    readonly tokenMissingSummary: string;
    readonly tokenMissingDescription: string;
    readonly invalidProfileTitle: string;
    readonly invalidProfileDescription: string;
    readonly reservedProfileTitle: string;
    readonly reservedProfileSummary: string;
    readonly reservedProfileDescription: string;
    readonly setupTokenFailedTitle: string;
    readonly exitCodeSummary: (code: string) => string;
    readonly setupTokenRetryDescription: string;
    readonly tokenVerifyFailedTitle: string;
    readonly tokenVerifyRetryDescription: string;
    readonly tokenVerifyApiErrorTitle: (status: number) => string;
    readonly tokenVerifyApiRetryDescription: (status: number) => string;
    readonly hostConfigNotSupportedTitle: string;
    readonly hostConfigNotSupportedDescription: string;
    readonly invalidConfigAssignmentTitle: string;
    readonly invalidConfigAssignmentDescription: string;
    readonly unknownConfigKeyTitle: string;
    readonly unknownConfigKeyDescription: string;
    readonly invalidConfigValueTitle: string;
    readonly invalidConfigValueDescription: string;
    readonly misplacedLaunchFlagTitle: (flag: string) => string;
    readonly misplacedLaunchFlagSummary: string;
    readonly misplacedLaunchFlagDescription: (profileId: string, flag: string) => string;
    readonly isolateModeNotImplementedTitle: string;
    readonly isolateModeNotImplementedDescription: string;
    readonly isolateSetupRequiredTitle: string;
    readonly isolateSetupRequiredSummary: string;
    readonly isolateSetupRequiredDescription: (profileId: string) => string;
    readonly isolateLoginFailedTitle: string;
    readonly isolateLoginRetryDescription: (profileId: string) => string;
    readonly isolateOverlayOnlyTitle: string;
    readonly isolateOverlayOnlySummary: string;
    readonly showcaseAllDescription: string;
    readonly showcaseAuthDescription: string;
    readonly showcaseErrorsDescription: string;
    readonly showcaseInkDescription: string;
    readonly missingBinaryTitle: string;
    readonly missingBinarySummary: string;
    readonly doctorDescription: string;
    readonly previewOnboardingDescription: string;
    readonly subprocessEnvScrubRequiredTitle: string;
    readonly subprocessEnvScrubRequiredSummary: string;
    readonly subprocessEnvScrubCompatDescription: string;
    readonly subprocessEnvScrubPersistDescription: string;
    readonly unexpectedError: string;
    readonly unknownShowcaseTopic: (topic: string) => string;
    readonly ccswitchImportInvalidTitle: string;
    readonly ccswitchImportInvalidDescription: string;
    readonly ccswitchImportMissingEnvTitle: string;
    readonly ccswitchImportMissingTokenTitle: string;
    readonly ccswitchImportMissingBaseUrlTitle: string;
    readonly ccswitchImportFileReadFailedTitle: string;
    readonly ccswitchImportFileReadFailedDescription: (path: string) => string;
  };
  readonly showcase: {
    readonly authIntro: string;
    readonly authSuccess: string;
    readonly rootHelp: string;
    readonly savedProfiles: string;
    readonly firstRun: string;
    readonly unknownProfileError: string;
    readonly reservedProfileError: string;
    readonly missingBinaryError: string;
    readonly doctorOutput: string;
    readonly commandFlows: string;
    readonly flowExamples: string;
    readonly flowAddDescription: string;
    readonly flowLaunchDescription: string;
    readonly flowContinueDescription: string;
    readonly flowHostDescription: string;
  };
  readonly misc: {
    readonly profileConfigurationCancelled: string;
    readonly noChangesMade: string;
    readonly removedProfile: (profileId: string) => string;
    readonly removedIsolate: (profileId: string) => string;
    readonly isolateAlreadyMissing: (profileId: string) => string;
    readonly isolateContinuityImportWarning: (profileId: string) => string;
    readonly isolateContinuityMissingWarning: (profileId: string) => string;
    readonly claudeExited: string;
    readonly ccoPrefix: (profileId: string) => string;
    readonly isolateStatusTitle: string;
    readonly isolateStatusReadyBadge: string;
    readonly isolateStatusMissingBadge: string;
    readonly isolateStatusBrokenBadge: string;
    readonly isolateBootstrapReadyTitle: string;
    readonly isolateBootstrapReadyLine1: string;
    readonly isolateBootstrapReadyLine2: (claudeHomeDir: string) => string;
    readonly isolateBootstrapReadyLine3: string;
  };
}

const KO_TEXT: UiText = {
  appDescription: "호스트 구성을 링크한 분리 Claude 홈과 프로필별 OAuth 전환을 위한 Claude Code 런처",
  commandBriefs: {
    runArgProfile: "실행에 사용할 저장된 프로필 ID. 생략하면 선택 UI를 표시합니다",
    run: "호스트 로그인 또는 선택한 저장 프로필로 Claude를 실행합니다",
    runFlagEnvCompat:
      "이번 실행만 하위 프로세스 인증 env 보호를 끕니다(compat mode, 저장된 프로필 설정은 바뀌지 않음)",
    host: "현재 호스트 Claude Code 로그인으로 Claude를 실행합니다",
    hostFlagEnvCompat:
      "이번 실행만 하위 프로세스 인증 env 보호를 끕니다(compat mode)",
    auth: "저장된 프로필 토큰을 관리합니다",
    authAddArgProfile: "저장할 프로필 ID. 예: work, backup",
    authAdd: "공식 setup-token 흐름으로 저장 프로필을 생성하거나 교체합니다",
    authAddFlagProvider:
      "OAuth setup-token 대신 baseUrl+token 기반의 provider 프로필로 저장합니다",
    authAddFlagFrom:
      "ccswitch 스타일 JSON 설정 파일 경로. 지정하면 대화형 프롬프트 없이 가져옵니다",
    authList: "로컬 저장 프로필과 토큰 존재 여부를 표시합니다",
    authRemoveArgProfile: "삭제할 프로필 ID",
    authRemove: "저장된 프로필과 로컬 토큰 파일을 삭제합니다",
    config: "저장된 프로필 설정을 조회하거나 변경합니다",
    configGetFlagProfile: "조회할 프로필 ID",
    configGet: "저장된 프로필 설정을 표시합니다",
    configSetFlagProfile: "변경할 프로필 ID",
    configSetArgAssignment:
      "설정 항목. 예: env.CLAUDE_CODE_SUBPROCESS_ENV_SCRUB=0",
    configSet: "저장된 프로필 설정을 변경합니다",
    doctor: "로컬 저장소, 환경변수 우선순위, Claude 실행 파일 탐지를 점검합니다",
    isolate: "격리 실행 환경 상태를 확인하거나 제거하고 새로 시작합니다",
    isolateArgProfile: "대상 프로필 ID",
    isolateFlagYes: "확인 프롬프트 없이 바로 진행합니다",
    isolateFlagClean: "host 설정 링크 없이 빈 isolate home으로 다시 시작합니다",
    isolateFlagImportLatestHostSession:
      "현재 작업 디렉터리 기준 최신 host 세션을 첫 isolate launch에서 바로 이어 시작합니다",
    isolateStatus: "현재 격리 실행 환경 상태와 메타데이터를 표시합니다",
    isolateRemove: "현재 프로필의 격리 실행 환경만 제거합니다",
    isolateFreshArg:
      "고급 플래그로 `--clean`, `--import-latest-host-session`를 사용할 수 있습니다",
    isolateFresh:
      "현재 격리 실행 환경을 제거한 뒤 fresh bootstrap으로 다시 실행합니다",
    ui: "터미널 크기 변경에 반응하는 터미널 컨트롤 패널을 엽니다",
    uiFlagRich: "상태 chip, 작업 그룹, topology flow를 쓰는 rich TUI 모드를 켭니다",
    showcaseArgTopic: "선택 사항: all, auth, help, profiles, errors, doctor, flows, ink",
    showcase: "Claude를 실행하지 않고 cco의 도움말, 오류, 흐름 화면을 미리 봅니다",
  },
  rootHelp: {
    badge: "프로필 런처",
    summary:
      "기본은 `cco <profile>`입니다. host-facing setup을 링크한 분리 Claude home에서 해당 프로필 인증으로 실행하고, `cco host`만 호스트 그대로 실행합니다.",
    quickStartTitle: "빠른 시작",
    quickStartBadge: "권장 흐름",
    quickStartAuthAdd: "공식 Claude setup-token용 로컬 프로필을 만듭니다.",
    quickStartLaunch: "host 설정 링크와 분리 Claude home에서 work 프로필로 Claude를 실행합니다.",
    quickStartContinue: "같은 프로필과 현재 프로젝트 세션을 Claude native continue로 이어갑니다.",
    quickStartHost: "프로필 대신 호스트 Claude 로그인 그대로 실행합니다.",
    quickStartShowcase: "Claude를 실행하지 않고 온보딩 화면을 미리 봅니다.",
    commandSurfaceTitle: "명령 표면",
    commandSurfaceProfile:
      "`cco <profile>`은 링크된 host setup + 분리 Claude home + 프로필 인증으로 실행합니다.",
    commandSurfaceHost: "`cco host`는 호스트 Claude 로그인으로 실행합니다.",
    commandSurfaceConfig:
      "`cco config get -p <profile>`은 저장된 프로필 설정을 확인합니다.",
    commandSurfaceDoctor: "`cco doctor`는 런타임 연결 상태와 환경변수 우선순위를 점검합니다.",
    commandSurfaceIsolate:
      "`cco isolate status/remove/fresh <profile>`은 격리 실행 환경을 점검하거나 정리합니다.",
    commandSurfaceUi: "`cco ui`는 기존 명령을 고르는 선택형 터미널 컨트롤 패널입니다.",
    commandSurfaceShowcase: "`cco showcase [topic]`은 Claude를 실행하지 않고 CLI 화면을 미리 봅니다.",
    localAliasBadge: "로컬 별칭",
    localAliasSummary:
      "프로필은 사용자가 정하는 이름입니다. 예: `work`, `backup`",
    launchSyntaxTitle: "실행 문법",
    launchSyntaxSummary:
      "일반적으로는 `cco <profile> [claude args...]`면 충분합니다. `--`는 Claude 인자 경계를 명시하고 싶을 때만 사용합니다.",
    launchSyntaxEasy: "`cco work -c`처럼 바로 이어서 실행합니다.",
    launchSyntaxAdvanced: "`cco <profile> -- <claude-args...>`",
    launchSyntaxAdvancedDescription:
      "Claude 인자 경계를 확실히 나누고 싶을 때 쓰는 고급 전달 방식입니다.",
    permissionScrubTitle: "권한 우회와 scrub",
    permissionScrubBadge: "safe profile",
    permissionScrubSummary:
      "safe mode 프로필에서 `--permission-mode bypassPermissions` 또는 `--dangerously-skip-permissions`를 쓰면 확인이 필요합니다.",
    permissionScrubCompatDescription:
      "이번 실행만 compat mode로 재실행합니다. 비대화형 셸에서도 그대로 사용할 수 있습니다.",
    permissionScrubPersistDescription:
      "저장된 프로필을 영구 compat mode로 바꿉니다.",
  },
  prompts: {
    pickProfile: "실행할 Claude 프로필을 선택하세요",
    hostHint: "호스트 로그인",
    overlayHint: "저장된 프로필",
    launchCancelled: "실행을 취소했습니다.",
    pasteToken: (profileId) => `"${profileId}"용 검증된 setup token을 붙여넣으세요`,
    tokenRequired: "토큰이 필요합니다.",
    tokenCancelled: "토큰 입력을 취소했습니다.",
    confirmRemove: (profileId) => `"${profileId}" 프로필과 저장된 토큰을 삭제할까요?`,
    removeCancelled: "프로필 삭제를 취소했습니다.",
    confirmIsolateRemove: (profileId) =>
      `"${profileId}"의 격리 실행 환경만 제거할까요? 호스트 Claude 설정과 저장된 토큰은 유지됩니다.`,
    isolateRemoveCancelled: "격리 실행 환경 제거를 취소했습니다.",
    permissionOverride: (profileId) =>
      `"${profileId}"는 현재 safe mode입니다. bypassPermissions 계열 요청을 어떻게 처리할까요?`,
    permissionOverrideCompatLabel: "이번 실행만 compat mode로 진행",
    permissionOverrideCompatHint:
      "이번 실행에서만 `CLAUDE_CODE_SUBPROCESS_ENV_SCRUB=0`을 사용합니다.",
    permissionOverrideSafeLabel: "safe mode 유지하고 계속",
    permissionOverrideSafeHint:
      "하위 프로세스는 계속 토큰을 읽지 못하지만 Claude가 권한 모드를 default로 강등할 수 있습니다.",
    permissionOverrideGuideLabel: "종료하고 재실행 방법 보기",
    permissionOverrideGuideHint:
      "scrub env 예시와 profiles.json 수정 위치를 출력하고 실행하지 않습니다.",
    isolateBootstrap: (profileId) =>
      `"${profileId}" 격리 실행용 Claude home 초기화 방식`,
    isolateBootstrapImportLabel: "현재 host 설정 가져오기",
    isolateBootstrapImportHint:
      "settings, mcp, plugins, skills 같은 안전한 사용자 설정만 복사합니다.",
    isolateBootstrapCleanLabel: "빈 상태로 시작",
    isolateBootstrapCleanHint:
      "별도 Claude home만 만들고, 팀 실행용 로그인을 처음부터 진행합니다.",
    isolateBootstrapCancelled: "격리 실행 초기화를 취소했습니다.",
    isolateContinuity: (profileId) =>
      `"${profileId}" 격리 실행으로 host 프로젝트 세션을 이어갈까요?`,
    isolateContinuityImportLabel: "host 최신 프로젝트 세션 가져오기",
    isolateContinuityImportHint:
      "현재 작업 디렉터리 기준 최신 host session JSONL만 isolate home으로 복사합니다.",
    isolateContinuitySkipLabel: "세션은 가져오지 않음",
    isolateContinuitySkipHint:
      "이번 isolate는 별도 대화 흐름으로 시작합니다. 이후 세션 활동도 isolate 내부에만 남습니다.",
    isolateContinuityCancelled: "세션 연속성 가져오기를 취소했습니다.",
    providerBaseUrl: (profileId) => `"${profileId}"용 provider baseUrl을 입력하세요`,
    providerBaseUrlRequired: "baseUrl이 필요합니다.",
    providerBaseUrlCancelled: "baseUrl 입력을 취소했습니다.",
    confirmModelMappings: (summary) =>
      `프로브에서 찾은 모델로 다음 env 매핑을 채울까요?\n${summary}`,
    confirmModelMappingsCancelled: "모델 매핑 제안을 취소했습니다.",
  },
  authAdd: {
    introTitle: "프로필 추가",
    introLine1: "이 흐름은 host-facing setup을 링크한 분리 Claude home 실행을 준비합니다.",
    introLine2: "검증된 setup-token만 cco 로컬 홈 아래에 저장됩니다.",
    nextTitle: "다음 단계",
    nextSetupToken: "claude setup-token",
    nextSetupTokenDescription: "현재 터미널/브라우저 컨텍스트에서 공식 Claude 토큰 발급 흐름을 실행합니다.",
    nextPasteToken: (profileId) => `${profileId}용 토큰 붙여넣기`,
    nextPasteTokenDescription: "숨김 입력으로 토큰을 받고, 저장 전에 검증합니다.",
    successTitle: "프로필 준비 완료",
    successRuntimePolicy: (modeLabel) => `저장된 실행 정책: ${modeLabel}`,
    successEnvProtectionNote:
      "하위 프로세스 인증 env 보호가 기본으로 켜져 있습니다. bypassPermissions 실행은 해당 실행에서만 자동으로 compat mode로 전환됩니다. 이번 실행만 다르게 하려면 --env-compat을 사용하세요.",
    successLaunch: (profileId) => `cco ${profileId}`,
    successLaunchDescription:
      "링크된 host setup과 분리 Claude home에서 이 프로필 인증으로 Claude를 실행합니다.",
    successContinue: (profileId) => `cco ${profileId} -c`,
    successContinueDescription:
      "같은 프로필과 현재 프로젝트 세션을 Claude native continue로 이어갑니다.",
    successList: "cco auth list",
    successListDescription: "저장된 프로필, 토큰 존재 여부, 실행 정책을 확인합니다.",
    successConfigGet: (profileId) => `cco config get -p ${profileId}`,
    successConfigGetDescription: "저장된 프로필 설정과 현재 scrub 모드를 확인합니다.",
    successEditProfiles: "나중에 profiles.json을 직접 수정해 저장된 env 정책을 바꿀 수 있습니다.",
    providerIntroTitle: "provider 프로필 추가",
    providerIntroLine1:
      "이 흐름은 OAuth setup-token 대신 baseUrl + token으로 동작하는 provider 프로필을 준비합니다.",
    providerIntroLine2: "claude setup-token은 실행하지 않습니다.",
    providerNextBaseUrl: "baseUrl 입력",
    providerNextBaseUrlDescription: "Anthropic 호환 프록시/서비스의 baseUrl을 받습니다.",
    providerNextToken: (profileId) => `${profileId}용 토큰 붙여넣기`,
    providerNextTokenDescription: "숨김 입력으로 토큰을 받습니다. 별도 spawn 검증은 하지 않습니다.",
    providerFromFileNotice: (path) => `"${path}"에서 provider 설정을 가져옵니다.`,
    providerProbeSuccess: (count) =>
      `/v1/models 프로브 성공: 모델 ${count}개 확인됨.`,
    providerProbeAuthWarn:
      "경고: /v1/models 프로브가 인증 실패로 응답했습니다. 토큰이 올바른지 확인하세요. baseUrl+token만으로 저장을 계속합니다.",
    providerProbeUnavailableWarn:
      "경고: /v1/models 프로브에 실패했습니다(엔드포인트 미구현 또는 타임아웃일 수 있음). baseUrl+token만으로 저장을 계속합니다.",
    providerMappingsApplied: (keys) => `자동 매핑을 적용했습니다: ${keys}`,
    providerMappingsSkipped: "자동 매핑 제안을 적용하지 않았습니다.",
    providerDroppedKeysSummary: (keys) => `가져오지 않은 키(이름만): ${keys}`,
    providerNotice: (notice) => `참고: ${notice}`,
    providerSuccessTitle: "Provider 프로필 준비 완료",
    providerSuccessBaseUrl: (baseUrl) => `baseUrl: ${baseUrl}`,
  },
  config: {
    getTitle: "프로필 설정",
    setSuccessTitle: "프로필 설정 저장됨",
    setSuccessSummary: (modeLabel) => `저장된 하위 프로세스 정책이 ${modeLabel}(으)로 바뀌었습니다.`,
  },
  profiles: {
    title: "프로필",
    overlayCount: (count) => `${count}개 프로필`,
    introLine1: "공식 Claude setup-token 값을 가리키는 로컬 별칭입니다.",
    introLine2:
      "`cco <profile>`는 host-facing setup을 링크한 분리 Claude home에서 이 프로필 인증으로 실행합니다.",
    inventoryTitle: "목록",
    nextStepTitle: "다음 단계",
    createOverlayBadge: "프로필 추가",
    noOverlay: "저장된 프로필이 아직 없습니다.",
    createOverlayDescription: "로컬 별칭을 만들고 검증된 setup-token을 저장합니다.",
    launchAfterSaveDescription: "토큰 저장 후 `cco work`로 바로 실행합니다.",
    editProfilesDescription: "나중에 profiles.json을 직접 수정해 프로필별 env 정책을 바꿀 수 있습니다.",
    readyBadge: (count) => `${count}개 준비됨`,
    nextBulletLaunch:
      "`cco <profile>`로 링크된 host setup + 분리 Claude home + 프로필 인증 조합으로 실행합니다.",
    nextBulletHost: "`cco host`로 호스트 Claude 로그인을 그대로 사용합니다.",
    nextBulletConfig:
      "`cco config get -p <profile>`와 `cco config set ... -p <profile>`로 저장된 프로필 설정을 확인하거나 바꿉니다.",
    nextBulletRemove: "`cco auth remove <profile>`로 로컬 별칭을 삭제합니다.",
    nextBulletEditProfiles: (profilesFile) => `${profilesFile} 파일을 직접 수정해 저장된 env 정책을 조정할 수 있습니다.`,
    nextBulletProfilesStored: "프로필은 cco의 로컬 profiles.json 파일에 저장됩니다.",
    hostBadge: "host",
    overlayBadge: "profile",
    hostLoginBadge: "호스트 로그인",
    storedBadge: "저장됨",
    missingBadge: "없음",
    lastUsedPrefix: "마지막 사용",
  },
  doctor: {
    title: "진단",
    readyBadge: "준비됨",
    checkEnvBadge: "환경 확인 필요",
    readyLine1: "현재 런타임은 host 실행과 분리 프로필 실행에 사용할 준비가 되어 있습니다.",
    readyLine2: "현재 셸에서는 충돌하는 인증 환경변수가 감지되지 않았습니다.",
    conflictLine1: "실행은 가능하지만, 현재 셸에 경쟁하는 인증 환경변수가 있습니다.",
    conflictLine2: "프로필 실행을 신뢰하기 전에 아래 충돌 변수를 먼저 확인하세요.",
    snapshotTitle: "런타임 스냅샷",
    suggestedNextStepTitle: "추천 다음 단계",
    suggestedCleanupTitle: "정리 권장",
    launchDescription: "저장된 프로필로 링크된 host setup + 분리 Claude home 실행을 시작합니다.",
    hostContinueDescription: "호스트 로그인을 유지한 채 Claude의 continue 플래그를 그대로 전달합니다.",
    cleanup1: "경쟁하는 인증 환경변수를 해제하거나 새 셸에서 다시 실행하세요.",
    cleanup2: "`cco doctor`를 다시 실행해 env 스냅샷이 깨끗한지 확인하세요.",
    cleanup3: "API 키와 OAuth env를 섞기보다는 `cco auth add <profile>` + `cco <profile>` 조합을 권장합니다.",
    defaultHostConfig: "(기본 Claude 호스트 구성)",
    launchMode: "링크된 host setup + 분리 Claude home + 프로필 인증",
    noneDetected: "감지되지 않음",
    shellScrubLabel: "shell-scrub",
    shellScrubInherit: "상속 없음 (저장된 프로필/기본값 사용)",
    shellScrubCompat: "0 (이번 실행만 compat)",
    shellScrubSafe: "1 (이번 실행만 safe 유지)",
    providerProfilesLabel: "provider-profiles",
    providerProfilesSummary: (count) => `${count}개 (baseUrl+token, ccswitch 호환)`,
    providerAuthEnvConflictNote:
      "ccswitch류 도구를 쓰는 셸에서는 부모 셸에 ANTHROPIC_AUTH_TOKEN이 남아 있는 것이 정상입니다. cco 프로필 실행은 이 값을 읽지 않고 격리된 프로세스 env로만 주입합니다.",
  },
  permissionMode: {
    safeMode: "safe mode",
    compatMode: "compat mode",
    warningTitle: "권한 모드 경고",
    warningLine1:
      "`--permission-mode bypassPermissions` 또는 `--dangerously-skip-permissions`는 현재 프로필의 safe mode env 정책과 충돌합니다.",
    warningLine2: "safe mode를 유지하면 Claude가 permission mode를 default로 되돌릴 가능성이 높습니다.",
    choicesTitle: "선택지",
    choiceCompat: "이번 실행만 compat mode로 내려 bypassPermissions를 유지합니다.",
    choiceSafe: "하위 프로세스가 프로필 인증 env를 읽지 못하게 하려면 safe mode를 유지합니다.",
    choiceGuide: "지금은 종료하고, scrub 환경변수나 profiles.json으로 다시 실행할 방법을 봅니다.",
    launchPolicyTitle: "이번 실행 정책",
    compatLine1: "이번 실행에서는 `CLAUDE_CODE_SUBPROCESS_ENV_SCRUB=0`을 임시로 사용합니다.",
    compatLine2: "저장된 프로필 값은 바뀌지 않습니다.",
    safeLine1: "이번 실행에서는 `CLAUDE_CODE_SUBPROCESS_ENV_SCRUB=1`을 유지합니다.",
    safeLine2: "Claude가 `bypassPermissions`를 기본 권한 모드로 강등할 수 있습니다.",
    guidanceTitle: "재실행 방법",
    guidanceLine1:
      "지금 실행은 중단합니다. safe mode 프로필에서 bypassPermissions 계열 플래그를 유지하려면 scrub 값을 먼저 정한 뒤 다시 실행하세요.",
    guidanceLine2:
      "아래 예시는 이번 실행만 compat로 돌리거나, 저장된 프로필을 영구 compat로 바꾸는 방법입니다.",
    guidanceNextTitle: "시도해볼 방법",
    guidanceCompatDescription:
      "이번 실행만 compat mode로 재실행합니다.",
    guidanceSafeDescription:
      "safe mode를 유지하려면 bypassPermissions 계열 플래그 없이 다시 실행하세요.",
    guidancePersistDescription:
      "저장된 프로필을 영구 compat mode로 바꿉니다.",
  },
  controlPanel: {
    title: "cco 컨트롤 패널",
    actionPrompt: "실행할 작업을 선택하세요",
    actionRun: "프로필 실행",
    actionRunHint: "cco <profile>",
    actionContinue: "프로필 이어가기",
    actionContinueHint: "cco <profile> -c",
    actionHost: "호스트 실행",
    actionHostHint: "cco host",
    actionExplain: "동작 설명",
    actionExplainHint: "auth/isolate/link/session 구조 확인",
    actionDoctor: "진단",
    actionDoctorHint: "cco doctor",
    actionStatus: "격리 상태",
    actionStatusHint: "cco isolate status <profile>",
    actionFresh: "격리 fresh",
    actionFreshHint: "cco isolate fresh <profile>",
    actionClean: "격리 clean fresh",
    actionCleanHint: "cco isolate fresh --clean <profile>",
    actionQuit: "종료",
    richGroupLaunch: "Launch",
    richGroupInspect: "Inspect",
    richGroupDanger: "Danger Zone",
    richGroupSystem: "System",
    richChipActive: "ACTIVE",
    richChipAuth: "AUTH",
    richChipIsolate: "ISOLATE",
    richChipLinks: "LINKS",
    richChipSession: "SESSION",
    richCardIdentity: "Identity",
    richCardRuntime: "Runtime",
    richCardContinuity: "Continuity",
    richTopologyTitle: "Topology",
    liveSummary: "기본 화면은 실행 가능 상태를, explain은 실제 백엔드 동작을 보여줍니다.",
    keyHelp: "↑↓ 작업 선택 · ←→/Tab 프로필 전환 · Enter 실행 · / 필터 · x 설명 · d 진단 · s 상태 · r 새로고침 · ? 도움말 · q 종료",
    compactKeyHelp: "Up/Down action | Left/Right profile | Enter run | / filter | x explain | d doctor | s status | r reload | ? help | q quit",
    stableModeBadge: "stable",
    richModeBadge: "rich",
    profileColumnTitle: "프로필",
    actionColumnTitle: "작업",
    detailColumnTitle: "현재 선택",
    explainColumnTitle: "동작 원리",
    confirmColumnTitle: "실행 확인",
    helpColumnTitle: "도움말",
    stableModeSummary: "stable mode는 emoji, gradient, 동적 resize badge를 쓰지 않습니다.",
    richModeSummary: "rich mode는 상태 chip, 작업 그룹, danger zone, topology flow로 빠른 상태 판독을 돕습니다.",
    hostProfileBadge: "host",
    hostClaudeHome: "호스트 Claude home",
    hostConfigSummary: "호스트 구성 직접 사용",
    cleanConfigSummary: "clean isolate home",
    hostLinkedConfigSummary: "host 구성 링크",
    hostSessionSummary: "호스트 native 세션",
    sessionLinkedSummary: "현재 프로젝트 세션 링크",
    sessionPendingSummary: "첫 continue 실행 시 링크",
    hostLinksOk: (ready, total) => `${ready}/${total} ready`,
    hostLinksPartial: (ready, total) => `${ready}/${total} 확인 필요`,
    hostLinkLinked: "linked",
    hostLinkPresent: "present",
    hostLinkMissingSource: "host 없음",
    hostLinkMissingTarget: "isolate 없음",
    explainProfileAuth: "저장된 setup-token은 생성된 Claude 프로세스에만 주입됩니다.",
    explainHostAuth: "host는 저장 토큰을 주입하지 않고 현재 호스트 Claude 로그인을 그대로 사용합니다.",
    explainIsolateHome: (homeDir) => `Claude home은 isolate 위치로 리다이렉트됩니다: ${homeDir}`,
    explainHostHome: "host 실행은 호스트 Claude home을 그대로 사용합니다.",
    explainSessionLink: (cwd) => `현재 작업 디렉터리 세션 store는 profile home과 연결되어 native -c가 이어집니다: ${cwd}`,
    explainHostSession: "host는 Claude native session store를 그대로 사용합니다.",
    noFilterResults: "필터와 일치하는 프로필이 없습니다.",
    confirmFreshSummary: (profileId) =>
      `"${profileId}" isolate home을 제거한 뒤 host-linked bootstrap으로 다시 실행합니다.`,
    confirmCleanSummary: (profileId) =>
      `"${profileId}" isolate home을 제거한 뒤 host 구성을 링크하지 않는 clean bootstrap으로 다시 실행합니다.`,
    confirmWarning: "Claude home, 링크/세션 메타데이터, 로컬 isolate 상태가 초기화될 수 있습니다. 프로젝트 파일은 삭제하지 않습니다.",
    confirmDefault: "기본 선택은 취소입니다. 실행하려면 [!] 실행을 명시적으로 선택하세요.",
    confirmCancel: "취소",
    confirmProceed: "[!] 실행",
    confirmCompactKeyHelp: "Left/Right choose | Enter confirm | y proceed | n/Esc cancel",
    overlayActionDisabled: "저장 프로필을 선택해야 사용할 수 있습니다.",
    pickProfile: "프로필을 선택하세요",
    pickSavedProfile: "저장된 프로필을 선택하세요",
    noSavedProfiles: "저장된 프로필이 없습니다. 먼저 `cco auth add <profile>`을 실행하세요.",
    notInteractive: "`cco ui`는 대화형 터미널에서만 사용할 수 있습니다.",
    cancelled: "컨트롤 패널을 종료했습니다.",
    returning: "작업이 끝났습니다. 컨트롤 패널로 돌아갑니다.",
  },
  errors: {
    problemTitle: "문제",
    nextStepTitle: "다음 단계",
    unknownProfileTitle: (profileId) => `알 수 없는 프로필: ${profileId}`,
    unknownProfileSummary: "먼저 로컬 별칭을 만들거나, 저장된 프로필 목록을 확인하세요.",
    createOverlayDescription: "새 프로필을 만들고 검증합니다.",
    inspectProfilesDescription: "저장된 host/profile 항목을 확인합니다.",
    tokenMissingSummary: "로컬 별칭은 있지만 토큰 파일이 없거나 읽을 수 없습니다.",
    tokenMissingDescription: "공식 setup-token 흐름을 다시 실행해 새 토큰을 저장하세요.",
    invalidProfileTitle: "프로필 이름이 올바르지 않습니다.",
    invalidProfileDescription: "소문자, 숫자, 하이픈, 밑줄만 사용하세요.",
    reservedProfileTitle: "예약된 프로필 이름입니다.",
    reservedProfileSummary: "예약어는 cco의 내장 명령과 연결되므로 로컬 별칭으로 사용할 수 없습니다.",
    reservedProfileDescription: "다른 로컬 별칭을 선택해 setup-token을 저장하세요.",
    setupTokenFailedTitle: "공식 `claude setup-token` 흐름이 정상적으로 끝나지 않았습니다.",
    exitCodeSummary: (code) => `종료 코드: ${code}`,
    setupTokenRetryDescription: "이 로컬 별칭에 대해 setup-token 흐름을 다시 시도하세요.",
    tokenVerifyFailedTitle: "토큰 검증에 실패했습니다.",
    tokenVerifyRetryDescription: "새 setup-token을 받아 다시 검증하세요.",
    tokenVerifyApiErrorTitle: (status) => {
      switch (status) {
        case 400:
          return "토큰 검증 요청이 올바르지 않습니다.";
        case 401:
          return "토큰이 유효하지 않거나 만료되었습니다.";
        case 402:
          return "결제 또는 구독 상태를 확인해야 합니다.";
        case 403:
          return "토큰에 필요한 권한이 없습니다.";
        case 404:
          return "검증에 필요한 Claude 리소스를 찾지 못했습니다.";
        case 409:
          return "Claude 요청 상태가 충돌했습니다.";
        case 413:
          return "토큰 검증 요청 크기 제한을 초과했습니다.";
        case 429:
          return "Claude 사용량 또는 요청 한도에 도달했습니다.";
        case 500:
          return "Anthropic 내부 오류가 발생했습니다.";
        case 504:
          return "Claude 응답 시간이 초과되었습니다.";
        case 529:
          return "Claude 서비스가 일시적으로 과부하 상태입니다.";
        default:
          return status >= 500
            ? "Claude 서비스를 일시적으로 사용할 수 없습니다."
            : "토큰 검증 API 요청에 실패했습니다.";
      }
    },
    tokenVerifyApiRetryDescription: (status) => {
      if (status === 401) return "새 setup-token을 받아 다시 검증하세요.";
      if (status === 402) return "결제 또는 구독 상태를 확인한 뒤 다시 실행하세요.";
      if (status === 403) return "계정과 조직의 Claude 접근 권한을 확인하세요.";
      if (status === 429) return "안내된 사용 한도 초기화 이후 다시 실행하세요.";
      if (status >= 500) return "잠시 후 다시 실행하세요.";
      return "Claude Code를 업데이트하거나 `cco doctor`로 환경을 확인한 뒤 다시 실행하세요.";
    },
    hostConfigNotSupportedTitle:
      "host 프로필에는 편집 가능한 프로필 설정이 없습니다.",
    hostConfigNotSupportedDescription:
      "config get/set은 저장된 프로필에만 적용됩니다.",
    invalidConfigAssignmentTitle: "설정 형식이 올바르지 않습니다.",
    invalidConfigAssignmentDescription:
      "`key=value` 형식으로 입력하세요. 예: env.CLAUDE_CODE_SUBPROCESS_ENV_SCRUB=0",
    unknownConfigKeyTitle: "지원하지 않는 설정 키입니다.",
    unknownConfigKeyDescription:
      "현재는 env.CLAUDE_CODE_SUBPROCESS_ENV_SCRUB만 변경할 수 있습니다.",
    invalidConfigValueTitle: "설정 값이 올바르지 않습니다.",
    invalidConfigValueDescription:
      "env.CLAUDE_CODE_SUBPROCESS_ENV_SCRUB는 `0` 또는 `1`만 허용합니다.",
    misplacedLaunchFlagTitle: (flag) => `${flag} 위치가 잘못되었습니다.`,
    misplacedLaunchFlagSummary:
      "이전 cco 실행 플래그 문법은 더 이상 지원되지 않습니다.",
    misplacedLaunchFlagDescription: (profileId, flag) =>
      `\`cco ${profileId}\` 또는 유지보수 명령 \`cco isolate ...\`로 다시 실행하세요.`,
    isolateModeNotImplementedTitle: "이 빌드에서는 해당 실행 경로를 사용할 수 없습니다.",
    isolateModeNotImplementedDescription:
      "현재 빌드는 canonical profile launch와 isolate maintenance 경로만 지원합니다.",
    isolateSetupRequiredTitle:
      "격리 home이 아직 준비되지 않아 비대화형으로는 시작할 수 없습니다.",
    isolateSetupRequiredSummary:
      "먼저 한 번 대화형으로 실행해 isolate home 준비를 마쳐야 합니다.",
    isolateSetupRequiredDescription: (profileId) =>
      `터미널에서 한 번 \`cco ${profileId}\`를 대화형으로 실행해 격리 home을 준비하세요.`,
    isolateLoginFailedTitle: "격리 프로필 실행 준비가 완료되지 않았습니다.",
    isolateLoginRetryDescription: (profileId) =>
      `같은 프로필로 \`cco ${profileId}\`를 다시 실행해 준비 단계를 마치세요.`,
    isolateOverlayOnlyTitle: "격리 실행은 저장된 프로필에서만 지원합니다.",
    isolateOverlayOnlySummary:
      "host 내장 프로필은 격리 메타데이터를 저장하지 않으므로 아직 지원하지 않습니다.",
    showcaseAllDescription: "전체 UI 표면을 미리 봅니다.",
    showcaseAuthDescription: "토큰 온보딩 패널만 미리 봅니다.",
    showcaseErrorsDescription: "복구/오류 상태만 미리 봅니다.",
    showcaseInkDescription: "Ink 기반 showcase 레이아웃을 미리 봅니다.",
    missingBinaryTitle: "Claude 실행 파일을 찾지 못해 실행할 수 없습니다.",
    missingBinarySummary: "설정되었거나 자동 탐지된 Claude 실행 파일이 현재 환경에 없습니다.",
    doctorDescription: "실행 파일 탐지, host config, env 우선순위를 확인합니다.",
    previewOnboardingDescription: "Claude를 실행하지 않고 온보딩 흐름을 미리 봅니다.",
    subprocessEnvScrubRequiredTitle:
      "비대화형 실행에서는 CLAUDE_CODE_SUBPROCESS_ENV_SCRUB 값을 먼저 정해야 합니다.",
    subprocessEnvScrubRequiredSummary:
      "현재 프로필은 safe mode이고 `--permission-mode bypassPermissions` 또는 `--dangerously-skip-permissions`가 전달되었습니다. TTY가 없어서 확인 프롬프트를 띄울 수 없습니다.",
    subprocessEnvScrubCompatDescription:
      "`CLAUDE_CODE_SUBPROCESS_ENV_SCRUB=0`으로 재실행하면 이번 실행만 compat mode로 진행합니다.",
    subprocessEnvScrubPersistDescription:
      "`cco config set env.CLAUDE_CODE_SUBPROCESS_ENV_SCRUB=0 -p <profile>`로 저장된 프로필을 영구 compat mode로 바꿀 수 있습니다.",
    unexpectedError: "예상하지 못한 오류입니다.",
    unknownShowcaseTopic: (topic) =>
      `알 수 없는 showcase 주제 "${topic}". 사용 가능: all, auth, help, profiles, errors, doctor, flows, ink`,
    ccswitchImportInvalidTitle: "가져오기 파일 형식이 올바르지 않습니다.",
    ccswitchImportInvalidDescription: "ccswitch 스타일 JSON 객체여야 합니다.",
    ccswitchImportMissingEnvTitle: "가져오기 파일에 \"env\" 객체가 없습니다.",
    ccswitchImportMissingTokenTitle:
      "가져오기 파일에 env.ANTHROPIC_AUTH_TOKEN이 없습니다.",
    ccswitchImportMissingBaseUrlTitle:
      "가져오기 파일에 env.ANTHROPIC_BASE_URL이 없습니다.",
    ccswitchImportFileReadFailedTitle: "가져오기 파일을 읽지 못했습니다.",
    ccswitchImportFileReadFailedDescription: (path) => `경로: ${path}`,
  },
  showcase: {
    authIntro: "프로필 추가 시작",
    authSuccess: "프로필 추가 완료",
    rootHelp: "루트 도움말",
    savedProfiles: "저장된 프로필",
    firstRun: "첫 실행 빈 상태",
    unknownProfileError: "없는 프로필 오류",
    reservedProfileError: "예약어 프로필 오류",
    missingBinaryError: "Claude 실행 파일 없음 오류",
    doctorOutput: "진단 화면",
    commandFlows: "명령 흐름",
    flowExamples: "흐름 예시",
    flowAddDescription: "공식 setup-token 흐름을 시작하고, 복사한 토큰을 받아 검증한 뒤 저장합니다.",
    flowLaunchDescription:
      "링크된 host setup, 분리 Claude home, work 프로필 인증으로 Claude를 실행합니다.",
    flowContinueDescription:
      "같은 프로필과 현재 프로젝트 세션을 Claude native continue로 이어갑니다.",
    flowHostDescription: "호스트 로그인을 유지한 채 Claude의 resume 인자를 그대로 전달합니다.",
  },
  misc: {
    profileConfigurationCancelled: "프로필 설정을 취소했습니다.",
    noChangesMade: "변경된 내용이 없습니다.",
    removedProfile: (profileId) => `"${profileId}" 프로필을 삭제했습니다.`,
    removedIsolate: (profileId) => `"${profileId}"의 격리 실행 환경을 제거했습니다.`,
    isolateAlreadyMissing: (profileId) =>
      `"${profileId}"의 격리 실행 환경이 이미 비어 있습니다.`,
    isolateContinuityImportWarning: (profileId) =>
      `경고: "${profileId}"의 host 세션 연속성 가져오기에 실패했습니다. resume handoff 없이 isolate launch를 계속합니다.`,
    isolateContinuityMissingWarning: (profileId) =>
      `경고: "${profileId}"에 가져올 host 세션이 현재 작업 디렉터리에서 발견되지 않았습니다. resume handoff 없이 isolate launch를 계속합니다.`,
    claudeExited: "Claude가 종료되었습니다.",
    ccoPrefix: (profileId) => `cco ${profileId}`,
    isolateStatusTitle: "Isolate 상태",
    isolateStatusReadyBadge: "ready",
    isolateStatusMissingBadge: "missing",
    isolateStatusBrokenBadge: "broken",
    isolateBootstrapReadyTitle: "격리 모드 준비",
    isolateBootstrapReadyLine1:
      "이 실행은 host와 분리된 별도 Claude home을 사용합니다.",
    isolateBootstrapReadyLine2: (claudeHomeDir) =>
      `대상 경로: ${claudeHomeDir}`,
    isolateBootstrapReadyLine3:
      "bootstrap이 끝나면 cco가 해당 isolate home으로 바로 실행합니다.",
  },
};

const EN_TEXT: UiText = {
  appDescription: "Claude Code launcher for linked host setup, isolated Claude homes, and per-profile OAuth switching",
  commandBriefs: {
    runArgProfile: "Saved profile id to use, or omit for profile picker",
    run: "Launch Claude with the host login or a selected saved profile",
    runFlagEnvCompat:
      "Turn off subprocess auth env protection for this launch only (compat mode; does not change the saved profile)",
    host: "Launch Claude with the host Claude Code login",
    hostFlagEnvCompat:
      "Turn off subprocess auth env protection for this launch only (compat mode)",
    auth: "Manage saved profile tokens",
    authAddArgProfile: "Profile id to save, such as work or backup",
    authAdd: "Create or replace a saved profile using the official setup-token flow",
    authAddFlagProvider:
      "Save a baseUrl+token provider profile instead of running the OAuth setup-token flow",
    authAddFlagFrom:
      "Path to a ccswitch-style JSON config file. When set, import without interactive prompts",
    authList: "List local saved profiles and token presence",
    authRemoveArgProfile: "Profile id to delete",
    authRemove: "Delete a saved profile and its local token file",
    config: "Inspect or update saved profile settings",
    configGetFlagProfile: "Profile id to inspect",
    configGet: "Show saved profile settings",
    configSetFlagProfile: "Profile id to update",
    configSetArgAssignment:
      "Setting assignment such as env.CLAUDE_CODE_SUBPROCESS_ENV_SCRUB=0",
    configSet: "Update a saved profile setting",
    doctor: "Check local storage, env precedence, and Claude binary resolution",
    isolate: "Inspect, remove, or recreate isolated Claude homes for saved profiles",
    isolateArgProfile: "Target profile id",
    isolateFlagYes: "Proceed without showing a confirmation prompt",
    isolateFlagClean: "Recreate the isolate home without linking host-facing setup",
    isolateFlagImportLatestHostSession:
      "Resume the latest host session for the current working directory on the first isolate launch",
    isolateStatus: "Show the current isolate state and metadata",
    isolateRemove: "Remove only the current profile's isolate home",
    isolateFreshArg:
      "Advanced flags include `--clean` and `--import-latest-host-session`",
    isolateFresh:
      "Remove the current isolate home and launch again through a fresh bootstrap",
    ui: "Open a terminal control panel that reacts to terminal resize",
    uiFlagRich: "Enable rich TUI mode with status chips, grouped actions, and topology flow",
    showcaseArgTopic: "Optional showcase topic: all, auth, help, profiles, errors, doctor, flows, or ink",
    showcase: "Preview cco help, errors, and flow output without launching Claude",
  },
  rootHelp: {
    badge: "profile launcher",
    summary:
      "Use `cco <profile>` as the default path. It runs with linked host-facing setup, a separate Claude home, and that profile's auth, while `cco host` keeps the host session untouched.",
    quickStartTitle: "Quick Start",
    quickStartBadge: "primary path",
    quickStartAuthAdd: "Create a local profile for an official Claude setup-token.",
    quickStartLaunch: "Launch Claude in the work profile's isolated home with linked host-facing setup.",
    quickStartContinue: "Continue the same profile and current-project session with Claude's native continue flag.",
    quickStartHost: "Run Claude with the host login unchanged instead of a saved profile.",
    quickStartShowcase: "Preview the onboarding panels without launching Claude.",
    commandSurfaceTitle: "Command Surface",
    commandSurfaceProfile:
      "`cco <profile>` launches with linked host setup, a separate Claude home, and that profile's auth.",
    commandSurfaceHost: "`cco host` launches with the host Claude login.",
    commandSurfaceConfig:
      "`cco config get -p <profile>` inspects saved profile settings.",
    commandSurfaceDoctor: "`cco doctor` inspects runtime wiring and env precedence.",
    commandSurfaceIsolate:
      "`cco isolate status/remove/fresh <profile>` inspects or resets the isolate home.",
    commandSurfaceUi: "`cco ui` opens an optional terminal control panel for existing commands.",
    commandSurfaceShowcase: "`cco showcase [topic]` previews the CLI surface without launching Claude.",
    localAliasBadge: "local alias",
    localAliasSummary: "Profiles are names you choose, such as `work` or `backup`.",
    launchSyntaxTitle: "Launch Syntax",
    launchSyntaxSummary:
      "For most launches, `cco <profile> [claude args...]` is enough. Use `--` only when you want an explicit Claude passthrough boundary.",
    launchSyntaxEasy: "Easy: launch directly, for example `cco work -c`.",
    launchSyntaxAdvanced: "`cco <profile> -- <claude-args...>`",
    launchSyntaxAdvancedDescription:
      "Advanced form for cases where the Claude passthrough boundary should stay explicit.",
    permissionScrubTitle: "Bypass Flags and Scrub",
    permissionScrubBadge: "safe profile",
    permissionScrubSummary:
      "If a safe-mode profile uses `--permission-mode bypassPermissions` or `--dangerously-skip-permissions`, cco needs an explicit decision.",
    permissionScrubCompatDescription:
      "Re-run once in compat mode. This works in non-interactive shells too.",
    permissionScrubPersistDescription:
      "Make the saved profile persistently compat.",
  },
  prompts: {
    pickProfile: "Pick the Claude profile to launch",
    hostHint: "host login",
    overlayHint: "saved profile",
    launchCancelled: "Launch cancelled.",
    pasteToken: (profileId) => `Paste the verified setup token for "${profileId}"`,
    tokenRequired: "Token is required.",
    tokenCancelled: "Token capture cancelled.",
    confirmRemove: (profileId) => `Remove profile "${profileId}" and delete its stored token?`,
    removeCancelled: "Profile removal cancelled.",
    confirmIsolateRemove: (profileId) =>
      `Remove only the isolate home for "${profileId}"? Host Claude config and saved token stay untouched.`,
    isolateRemoveCancelled: "Isolate removal cancelled.",
    permissionOverride: (profileId) =>
      `"${profileId}" is still in safe mode. How should this bypass-permission request be handled?`,
    permissionOverrideCompatLabel: "Use compat mode for this launch only",
    permissionOverrideCompatHint:
      "Applies `CLAUDE_CODE_SUBPROCESS_ENV_SCRUB=0` for this launch only.",
    permissionOverrideSafeLabel: "Keep safe mode and continue",
    permissionOverrideSafeHint:
      "Child subprocesses still cannot read the token, but Claude may downgrade the permission mode back to default.",
    permissionOverrideGuideLabel: "Exit and show re-run options",
    permissionOverrideGuideHint:
      "Print scrub env examples and the profiles.json edit path without launching Claude.",
    isolateBootstrap: (profileId) =>
      `How should the isolate Claude home for "${profileId}" be initialized?`,
    isolateBootstrapImportLabel: "Import current host setup",
    isolateBootstrapImportHint:
      "Copies only safe user-facing config such as settings, mcp, plugins, and skills.",
    isolateBootstrapCleanLabel: "Start clean",
    isolateBootstrapCleanHint:
      "Creates an empty Claude home and signs in for team runs from scratch.",
    isolateBootstrapCancelled: "Isolate bootstrap cancelled.",
    isolateContinuity: (profileId) =>
      `Should "${profileId}" also import the latest host project session?`,
    isolateContinuityImportLabel: "Import latest host project session",
    isolateContinuityImportHint:
      "Copies only the latest host session JSONL for the current working directory into the isolate home.",
    isolateContinuitySkipLabel: "Keep sessions separate",
    isolateContinuitySkipHint:
      "Start this isolate as a separate conversation. Later session activity also stays isolate-local.",
    isolateContinuityCancelled: "Session continuity import cancelled.",
    providerBaseUrl: (profileId) => `Enter the provider baseUrl for "${profileId}"`,
    providerBaseUrlRequired: "baseUrl is required.",
    providerBaseUrlCancelled: "baseUrl entry cancelled.",
    confirmModelMappings: (summary) =>
      `Fill in these env mappings from the probed models?\n${summary}`,
    confirmModelMappingsCancelled: "Model mapping suggestion cancelled.",
  },
  authAdd: {
    introTitle: "Add Profile",
    introLine1: "This flow prepares the linked-host isolated-home launch path for a saved profile.",
    introLine2: "Only a verified setup-token for this local alias will be stored under cco's local home.",
    nextTitle: "What Happens Next",
    nextSetupToken: "claude setup-token",
    nextSetupTokenDescription: "Runs the official Claude token flow in the current terminal/browser context.",
    nextPasteToken: (profileId) => `paste token for ${profileId}`,
    nextPasteTokenDescription: "The token is captured with hidden input and verified before it is saved.",
    successTitle: "Profile Ready",
    successRuntimePolicy: (modeLabel) => `Saved runtime policy: ${modeLabel}.`,
    successEnvProtectionNote:
      "Subprocess auth env protection is ON by default. Bypass-permissions launches auto-switch to compat mode for that run only. Use --env-compat for a one-shot override.",
    successLaunch: (profileId) => `cco ${profileId}`,
    successLaunchDescription:
      "Launch Claude with linked host-facing setup, a separate Claude home, and this profile's auth.",
    successContinue: (profileId) => `cco ${profileId} -c`,
    successContinueDescription:
      "Continue the same profile and current-project session with Claude's native continue flag.",
    successList: "cco auth list",
    successListDescription: "Inspect saved profiles, token presence, and runtime policy.",
    successConfigGet: (profileId) => `cco config get -p ${profileId}`,
    successConfigGetDescription: "Inspect the saved profile settings and current scrub mode.",
    successEditProfiles: "Edit profiles.json directly later to adjust the stored env policy.",
    providerIntroTitle: "Add Provider Profile",
    providerIntroLine1:
      "This flow prepares a provider profile that authenticates with baseUrl + token instead of OAuth setup-token.",
    providerIntroLine2: "claude setup-token is not run for this flow.",
    providerNextBaseUrl: "enter baseUrl",
    providerNextBaseUrlDescription: "Captures the baseUrl for an Anthropic-compatible proxy or service.",
    providerNextToken: (profileId) => `paste token for ${profileId}`,
    providerNextTokenDescription: "The token is captured with hidden input. No spawn-based verification is run.",
    providerFromFileNotice: (path) => `Importing provider config from "${path}".`,
    providerProbeSuccess: (count) => `/v1/models probe succeeded: found ${count} model(s).`,
    providerProbeAuthWarn:
      "Warning: the /v1/models probe returned an auth failure. Double-check the token. Continuing to save with baseUrl+token only.",
    providerProbeUnavailableWarn:
      "Warning: the /v1/models probe failed (endpoint may be unimplemented or timed out). Continuing to save with baseUrl+token only.",
    providerMappingsApplied: (keys) => `Applied auto-mapping: ${keys}`,
    providerMappingsSkipped: "Auto-mapping suggestions were not applied.",
    providerDroppedKeysSummary: (keys) => `Keys not imported (names only): ${keys}`,
    providerNotice: (notice) => `Note: ${notice}`,
    providerSuccessTitle: "Provider Profile Ready",
    providerSuccessBaseUrl: (baseUrl) => `baseUrl: ${baseUrl}`,
  },
  config: {
    getTitle: "Profile Config",
    setSuccessTitle: "Profile Config Saved",
    setSuccessSummary: (modeLabel) =>
      `Saved subprocess policy now resolves to ${modeLabel}.`,
  },
  profiles: {
    title: "Profiles",
    overlayCount: (count) => `${count} profile`,
    introLine1: "Local aliases for official Claude setup-token values.",
    introLine2:
      "`cco <profile>` launches with linked host-facing setup, a separate Claude home, and that profile's auth.",
    inventoryTitle: "Inventory",
    nextStepTitle: "Next Step",
    createOverlayBadge: "add profile",
    noOverlay: "No saved profiles are stored yet.",
    createOverlayDescription: "Create a local alias and save a verified setup-token.",
    launchAfterSaveDescription: "Launch Claude with `cco work` once the token is saved.",
    editProfilesDescription: "Edit profiles.json directly later to adjust per-profile env policy.",
    readyBadge: (count) => `${count} ready`,
    nextBulletLaunch:
      "Use `cco <profile>` to launch with linked host setup, an isolated Claude home, and saved profile auth.",
    nextBulletHost: "Use `cco host` to launch with the host Claude login.",
    nextBulletConfig:
      "Use `cco config get -p <profile>` and `cco config set ... -p <profile>` to inspect or update saved profile settings.",
    nextBulletRemove: "Use `cco auth remove <profile>` to delete a local alias.",
    nextBulletEditProfiles: (profilesFile) => `Edit ${profilesFile} directly if you want to tune a saved profile's env policy.`,
    nextBulletProfilesStored: "Profiles are stored in cco's local profiles.json file.",
    hostBadge: "host",
    overlayBadge: "profile",
    hostLoginBadge: "host login",
    storedBadge: "stored",
    missingBadge: "missing",
    lastUsedPrefix: "last used",
  },
  doctor: {
    title: "Doctor",
    readyBadge: "ready",
    checkEnvBadge: "check env",
    readyLine1: "Runtime looks ready for host launches and isolated profile launches.",
    readyLine2: "No conflicting auth environment variables were detected in the current shell.",
    conflictLine1: "Runtime is launchable, but the current shell has competing auth environment variables.",
    conflictLine2: "Review the conflicting variables below before trusting a profile launch.",
    snapshotTitle: "Runtime Snapshot",
    suggestedNextStepTitle: "Suggested Next Step",
    suggestedCleanupTitle: "Suggested Cleanup",
    launchDescription:
      "Launch Claude with linked host setup, a separate Claude home, and saved profile auth.",
    hostContinueDescription: "Keep the host login and pass Claude's native continue flag through unchanged.",
    cleanup1: "Unset the competing auth variables or start a clean shell.",
    cleanup2: "Run `cco doctor` again to confirm the env snapshot is clean.",
    cleanup3: "Prefer `cco auth add <profile>` plus `cco <profile>` over mixing API and OAuth env vars.",
    defaultHostConfig: "(default Claude host config)",
    launchMode: "linked host setup + isolated Claude home + profile auth",
    noneDetected: "none detected",
    shellScrubLabel: "shell-scrub",
    shellScrubInherit: "no override (use saved profile/default)",
    shellScrubCompat: "0 (compat for this launch)",
    shellScrubSafe: "1 (keep safe for this launch)",
    providerProfilesLabel: "provider-profiles",
    providerProfilesSummary: (count) => `${count} (baseUrl+token, ccswitch-compatible)`,
    providerAuthEnvConflictNote:
      "If you use ccswitch-style tools, a leftover ANTHROPIC_AUTH_TOKEN in the parent shell is expected. Profile launches never read that value; auth is injected only into the isolated child process env.",
  },
  permissionMode: {
    safeMode: "safe mode",
    compatMode: "compat mode",
    warningTitle: "Permission Mode Warning",
    warningLine1:
      "`--permission-mode bypassPermissions` or `--dangerously-skip-permissions` conflicts with this profile's safe-mode env policy.",
    warningLine2: "If you keep safe mode, Claude will usually force permission mode back to default.",
    choicesTitle: "Choices",
    choiceCompat: "Allow compat mode for this launch only to keep bypassPermissions intact.",
    choiceSafe: "Keep safe mode if you do not want child subprocesses to read the profile auth env.",
    choiceGuide: "Exit now and view re-run guidance based on scrub env or profiles.json.",
    launchPolicyTitle: "Launch Policy",
    compatLine1: "This launch will set `CLAUDE_CODE_SUBPROCESS_ENV_SCRUB=0` temporarily.",
    compatLine2: "The saved profile stays unchanged.",
    safeLine1: "This launch will keep `CLAUDE_CODE_SUBPROCESS_ENV_SCRUB=1`.",
    safeLine2: "Claude may downgrade `bypassPermissions` to the default permission mode.",
    guidanceTitle: "How to Re-run",
    guidanceLine1:
      "This launch is stopping here. If you want to keep bypass-permission flags on a safe-mode profile, decide the scrub value before re-running.",
    guidanceLine2:
      "Use the examples below to re-run once in compat mode, or to make the profile persistently compat.",
    guidanceNextTitle: "Try One of These",
    guidanceCompatDescription:
      "Re-run once in compat mode.",
    guidanceSafeDescription:
      "Keep safe mode by re-running without bypass-permission flags.",
    guidancePersistDescription:
      "Make the saved profile persistently compat.",
  },
  controlPanel: {
    title: "cco Control Panel",
    actionPrompt: "Choose an action",
    actionRun: "Run profile",
    actionRunHint: "cco <profile>",
    actionContinue: "Continue profile",
    actionContinueHint: "cco <profile> -c",
    actionHost: "Run host",
    actionHostHint: "cco host",
    actionExplain: "Explain runtime",
    actionExplainHint: "inspect auth/isolate/link/session topology",
    actionDoctor: "Doctor",
    actionDoctorHint: "cco doctor",
    actionStatus: "Isolate status",
    actionStatusHint: "cco isolate status <profile>",
    actionFresh: "Fresh isolate",
    actionFreshHint: "cco isolate fresh <profile>",
    actionClean: "Clean fresh isolate",
    actionCleanHint: "cco isolate fresh --clean <profile>",
    actionQuit: "Quit",
    richGroupLaunch: "Launch",
    richGroupInspect: "Inspect",
    richGroupDanger: "Danger Zone",
    richGroupSystem: "System",
    richChipActive: "ACTIVE",
    richChipAuth: "AUTH",
    richChipIsolate: "ISOLATE",
    richChipLinks: "LINKS",
    richChipSession: "SESSION",
    richCardIdentity: "Identity",
    richCardRuntime: "Runtime",
    richCardContinuity: "Continuity",
    richTopologyTitle: "Topology",
    liveSummary: "The default view shows launch readiness; explain shows the actual backend topology.",
    keyHelp: "↑↓ action · ←→/Tab profile · Enter run · / filter · x explain · d doctor · s status · r reload · ? help · q quit",
    compactKeyHelp: "Up/Down action | Left/Right profile | Enter run | / filter | x explain | d doctor | s status | r reload | ? help | q quit",
    stableModeBadge: "stable",
    richModeBadge: "rich",
    profileColumnTitle: "Profiles",
    actionColumnTitle: "Actions",
    detailColumnTitle: "Current selection",
    explainColumnTitle: "Runtime Topology",
    confirmColumnTitle: "Confirm Action",
    helpColumnTitle: "Help",
    stableModeSummary: "Stable mode avoids emoji, gradients, and dynamic resize badges.",
    richModeSummary: "Rich mode adds status chips, grouped actions, a danger zone, and topology flow for faster scanning.",
    hostProfileBadge: "host",
    hostClaudeHome: "host Claude home",
    hostConfigSummary: "uses host config directly",
    cleanConfigSummary: "clean isolate home",
    hostLinkedConfigSummary: "linked host setup",
    hostSessionSummary: "host native session",
    sessionLinkedSummary: "current project session linked",
    sessionPendingSummary: "links on first continue launch",
    hostLinksOk: (ready, total) => `${ready}/${total} ready`,
    hostLinksPartial: (ready, total) => `${ready}/${total} need attention`,
    hostLinkLinked: "linked",
    hostLinkPresent: "present",
    hostLinkMissingSource: "missing host source",
    hostLinkMissingTarget: "missing isolate target",
    explainProfileAuth: "The saved setup-token is injected only into the spawned Claude process.",
    explainHostAuth: "The host profile does not inject a saved token and keeps the host Claude login.",
    explainIsolateHome: (homeDir) => `Claude home is redirected to the isolate path: ${homeDir}`,
    explainHostHome: "The host profile keeps the host Claude home.",
    explainSessionLink: (cwd) => `The current working directory session store is linked so native -c stays continuous: ${cwd}`,
    explainHostSession: "The host profile uses Claude's native session store directly.",
    noFilterResults: "No profiles match the filter.",
    confirmFreshSummary: (profileId) =>
      `Remove the "${profileId}" isolate home and launch again through host-linked bootstrap.`,
    confirmCleanSummary: (profileId) =>
      `Remove the "${profileId}" isolate home and launch again through clean bootstrap without linked host setup.`,
    confirmWarning: "Claude home, link/session metadata, and local isolate state may be reset. Project files are not deleted.",
    confirmDefault: "The default choice is cancel. Select [!] proceed explicitly to continue.",
    confirmCancel: "Cancel",
    confirmProceed: "[!] Proceed",
    confirmCompactKeyHelp: "Left/Right choose | Enter confirm | y proceed | n/Esc cancel",
    overlayActionDisabled: "Select a saved profile to use this action.",
    pickProfile: "Pick a profile",
    pickSavedProfile: "Pick a saved profile",
    noSavedProfiles: "No saved profiles are available. Run `cco auth add <profile>` first.",
    notInteractive: "`cco ui` requires an interactive terminal.",
    cancelled: "Control panel closed.",
    returning: "Action completed. Returning to the control panel.",
  },
  errors: {
    problemTitle: "Problem",
    nextStepTitle: "Next Step",
    unknownProfileTitle: (profileId) => `Unknown profile: ${profileId}`,
    unknownProfileSummary: "Create the local alias first, or inspect the saved profiles.",
    createOverlayDescription: "Create and verify a new profile.",
    inspectProfilesDescription: "Inspect the saved host/profile entries.",
    tokenMissingSummary: "The local alias exists, but its token file is missing or unreadable.",
    tokenMissingDescription: "Re-run the official setup-token flow and save a fresh token.",
    invalidProfileTitle: "Invalid profile id.",
    invalidProfileDescription: "Use lowercase letters, numbers, hyphens, or underscores only.",
    reservedProfileTitle: "Reserved profile id.",
    reservedProfileSummary: "Reserved names map to built-in cco commands and cannot be reused as local aliases.",
    reservedProfileDescription: "Choose a different local alias for the setup-token.",
    setupTokenFailedTitle: "The official `claude setup-token` flow did not complete successfully.",
    exitCodeSummary: (code) => `Exit code: ${code}`,
    setupTokenRetryDescription: "Retry the setup-token flow for this local alias.",
    tokenVerifyFailedTitle: "Token verification failed.",
    tokenVerifyRetryDescription: "Capture a fresh setup-token and verify it again.",
    tokenVerifyApiErrorTitle: (status) => {
      switch (status) {
        case 400:
          return "The token verification request was invalid.";
        case 401:
          return "The token is invalid or expired.";
        case 402:
          return "Your billing or subscription status needs attention.";
        case 403:
          return "The token does not have the required permission.";
        case 404:
          return "The Claude resource required for verification was not found.";
        case 409:
          return "The Claude request conflicted with the current state.";
        case 413:
          return "The token verification request was too large.";
        case 429:
          return "You have reached a Claude usage or rate limit.";
        case 500:
          return "Anthropic encountered an internal error.";
        case 504:
          return "The Claude request timed out.";
        case 529:
          return "Claude is temporarily overloaded.";
        default:
          return status >= 500
            ? "Claude is temporarily unavailable."
            : "The token verification API request failed.";
      }
    },
    tokenVerifyApiRetryDescription: (status) => {
      if (status === 401) return "Capture a fresh setup-token and verify it again.";
      if (status === 402) return "Check billing or subscription status, then retry.";
      if (status === 403) return "Check the account and organization's Claude access.";
      if (status === 429) return "Retry after the usage limit resets.";
      if (status >= 500) return "Retry in a moment.";
      return "Update Claude Code or run `cco doctor` before retrying.";
    },
    hostConfigNotSupportedTitle:
      "The host profile does not have editable profile config.",
    hostConfigNotSupportedDescription:
      "config get/set only applies to saved profiles.",
    invalidConfigAssignmentTitle: "Invalid config assignment.",
    invalidConfigAssignmentDescription:
      "Use key=value format, for example env.CLAUDE_CODE_SUBPROCESS_ENV_SCRUB=0.",
    unknownConfigKeyTitle: "Unsupported config key.",
    unknownConfigKeyDescription:
      "Only env.CLAUDE_CODE_SUBPROCESS_ENV_SCRUB is currently editable.",
    invalidConfigValueTitle: "Invalid config value.",
    invalidConfigValueDescription:
      "env.CLAUDE_CODE_SUBPROCESS_ENV_SCRUB only accepts `0` or `1`.",
    misplacedLaunchFlagTitle: (flag) => `${flag} is in the wrong position.`,
    misplacedLaunchFlagSummary:
      "This old cco launch-flag form is no longer supported.",
    misplacedLaunchFlagDescription: (profileId, flag) =>
      `Re-run with \`cco ${profileId}\` or use an isolate maintenance command under \`cco isolate ...\`.`,
    isolateModeNotImplementedTitle: "This launch path is not available in the current build.",
    isolateModeNotImplementedDescription:
      "This build supports the canonical profiled launch path and isolate maintenance commands only.",
    isolateSetupRequiredTitle:
      "The isolate home is not ready yet, so this launch cannot run non-interactively.",
    isolateSetupRequiredSummary:
      "Run the profile once interactively to finish preparing the isolate home first.",
    isolateSetupRequiredDescription: (profileId) =>
      `Run \`cco ${profileId}\` once in an interactive terminal to prepare the isolate home.`,
    isolateLoginFailedTitle: "The profiled isolate launch did not finish preparing successfully.",
    isolateLoginRetryDescription: (profileId) =>
      `Run \`cco ${profileId}\` again to complete the preparation step.`,
    isolateOverlayOnlyTitle: "Isolate mode currently supports saved profiles only.",
    isolateOverlayOnlySummary:
      "The built-in host profile does not persist isolate metadata yet, so it is not supported in this build.",
    showcaseAllDescription: "Preview the full UI surface.",
    showcaseAuthDescription: "Preview the token onboarding panels.",
    showcaseErrorsDescription: "Preview the recovery/error states only.",
    showcaseInkDescription: "Preview the Ink-powered showcase layout.",
    missingBinaryTitle: "Could not launch Claude because the binary was not found.",
    missingBinarySummary: "The configured or discovered Claude executable is missing from the current environment.",
    doctorDescription: "Inspect binary resolution, host config, and env precedence.",
    previewOnboardingDescription: "Preview the onboarding flow without launching Claude.",
    subprocessEnvScrubRequiredTitle:
      "Non-interactive launches must choose CLAUDE_CODE_SUBPROCESS_ENV_SCRUB up front.",
    subprocessEnvScrubRequiredSummary:
      "The current profile is still in safe mode and `--permission-mode bypassPermissions` or `--dangerously-skip-permissions` was requested, but no TTY is available for an interactive confirmation.",
    subprocessEnvScrubCompatDescription:
      "Re-run with `CLAUDE_CODE_SUBPROCESS_ENV_SCRUB=0` to allow compat mode for this launch.",
    subprocessEnvScrubPersistDescription:
      "Use `cco config set env.CLAUDE_CODE_SUBPROCESS_ENV_SCRUB=0 -p <profile>` to make the saved profile persistently compat.",
    unexpectedError: "Unexpected error.",
    unknownShowcaseTopic: (topic) =>
      `Unknown showcase topic "${topic}". Use one of: all, auth, help, profiles, errors, doctor, flows, ink.`,
    ccswitchImportInvalidTitle: "Invalid import file format.",
    ccswitchImportInvalidDescription: "The file must be a ccswitch-style JSON object.",
    ccswitchImportMissingEnvTitle: "The import file is missing an \"env\" object.",
    ccswitchImportMissingTokenTitle:
      "The import file is missing env.ANTHROPIC_AUTH_TOKEN.",
    ccswitchImportMissingBaseUrlTitle:
      "The import file is missing env.ANTHROPIC_BASE_URL.",
    ccswitchImportFileReadFailedTitle: "Could not read the import file.",
    ccswitchImportFileReadFailedDescription: (path) => `Path: ${path}`,
  },
  showcase: {
    authIntro: "Auth Add Intro",
    authSuccess: "Auth Add Success",
    rootHelp: "Root Help",
    savedProfiles: "Saved Profiles",
    firstRun: "First Run Empty State",
    unknownProfileError: "Unknown Profile Error",
    reservedProfileError: "Reserved Profile Error",
    missingBinaryError: "Missing Claude Binary Error",
    doctorOutput: "Doctor Output",
    commandFlows: "Command Flows",
    flowExamples: "Flow Examples",
    flowAddDescription: "Starts the official setup-token flow, then captures and verifies the copied token.",
    flowLaunchDescription:
      "Launches Claude with linked host-facing setup, an isolated Claude home, and the work profile auth.",
    flowContinueDescription:
      "Continues the same profile and current-project session with Claude's native continue flag.",
    flowHostDescription: "Keeps the host login and passes native resume arguments through unchanged.",
  },
  misc: {
    profileConfigurationCancelled: "Profile configuration cancelled.",
    noChangesMade: "No changes made.",
    removedProfile: (profileId) => `Removed profile "${profileId}".`,
    removedIsolate: (profileId) => `Removed the isolate home for "${profileId}".`,
    isolateAlreadyMissing: (profileId) =>
      `The isolate home for "${profileId}" is already absent.`,
    isolateContinuityImportWarning: (profileId) =>
      `Warning: host session continuity import for "${profileId}" failed. Launching the isolate without resume handoff.`,
    isolateContinuityMissingWarning: (profileId) =>
      `Warning: no host session for "${profileId}" was found in the current working directory. Launching the isolate without resume handoff.`,
    claudeExited: "Claude exited.",
    ccoPrefix: (profileId) => `cco ${profileId}`,
    isolateStatusTitle: "Isolate Status",
    isolateStatusReadyBadge: "ready",
    isolateStatusMissingBadge: "missing",
    isolateStatusBrokenBadge: "broken",
    isolateBootstrapReadyTitle: "Isolate Setup",
    isolateBootstrapReadyLine1:
      "This launch will prepare a Claude home kept separate from the host for this profile.",
    isolateBootstrapReadyLine2: (claudeHomeDir) =>
      `Target home: ${claudeHomeDir}`,
    isolateBootstrapReadyLine3:
      "After bootstrap, cco will launch directly with that isolated home.",
  },
};

export function resolveAppLocale(env: NodeJS.ProcessEnv): AppLocale {
  const raw = (env.CCO_LOCALE ?? env.LANG ?? "ko").toLowerCase();
  return raw.startsWith("en") ? "en" : "ko";
}

export function getUiText(locale: AppLocale = "ko"): UiText {
  return locale === "en" ? EN_TEXT : KO_TEXT;
}

export function getStaticUiText(): UiText {
  return getUiText(resolveAppLocale(process.env));
}

export function getStricliText(localeLike: string | undefined): ApplicationText {
  const locale = normalizeLocale(localeLike);
  if (locale === "en") {
    return text_en;
  }

  return {
    ...text_en,
    headers: {
      usage: "사용법",
      aliases: "별칭",
      commands: "명령",
      flags: "플래그",
      arguments: "인자",
    },
    keywords: {
      default: "기본값 =",
      separator: "구분자 =",
    },
    briefs: {
      help: "도움말을 출력하고 종료합니다",
      helpAll: "숨김 명령/플래그를 포함한 도움말을 출력하고 종료합니다",
      version: "버전 정보를 출력하고 종료합니다",
      argumentEscapeSequence: "이후 입력은 모두 인자로 해석합니다",
    },
    noCommandRegisteredForInput: ({ input, corrections }) => {
      const base = `입력 "${input}"에 해당하는 명령을 찾지 못했습니다.`;
      if (corrections.length === 0) {
        return base;
      }

      return `${base} ${corrections.join(", ")} 중 하나를 시도해 보세요.`;
    },
    noTextAvailableForLocale: ({ requestedLocale, defaultLocale }) =>
      `로케일 "${requestedLocale}"에 사용할 텍스트가 없어 기본 로케일 "${defaultLocale}"로 대체합니다.`,
    currentVersionIsNotLatest: ({ currentVersion, latestVersion }) =>
      `현재 버전 ${currentVersion}은 최신 버전 ${latestVersion}이 아닙니다.`,
  };
}

function normalizeLocale(localeLike: string | undefined): AppLocale {
  if (!localeLike) {
    return "ko";
  }

  return localeLike.toLowerCase().startsWith("en") ? "en" : "ko";
}
