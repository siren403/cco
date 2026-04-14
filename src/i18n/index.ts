import { text_en, type ApplicationText } from "@stricli/core";

export type AppLocale = "ko" | "en";

export interface UiText {
  readonly appDescription: string;
  readonly commandBriefs: {
    readonly runArgProfile: string;
    readonly run: string;
    readonly host: string;
    readonly auth: string;
    readonly authAddArgProfile: string;
    readonly authAdd: string;
    readonly authList: string;
    readonly authRemoveArgProfile: string;
    readonly authRemove: string;
    readonly doctor: string;
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
    readonly quickStartShowcase: string;
    readonly commandSurfaceTitle: string;
    readonly commandSurfaceProfile: string;
    readonly commandSurfaceHost: string;
    readonly commandSurfaceDoctor: string;
    readonly commandSurfaceShowcase: string;
    readonly localAliasBadge: string;
    readonly localAliasSummary: string;
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
    readonly profileEnvPolicy: (profileId: string) => string;
    readonly profileEnvSafeLabel: string;
    readonly profileEnvSafeHint: string;
    readonly profileEnvCompatLabel: string;
    readonly profileEnvCompatHint: string;
    readonly profileEnvCancelled: string;
    readonly permissionOverride: (profileId: string) => string;
    readonly permissionOverrideYes: string;
    readonly permissionOverrideNo: string;
  };
  readonly authAdd: {
    readonly introTitle: string;
    readonly introLine1: string;
    readonly introLine2: string;
    readonly nextTitle: string;
    readonly nextPickMode: string;
    readonly nextPickModeDescription: string;
    readonly nextSetupToken: string;
    readonly nextSetupTokenDescription: string;
    readonly nextPasteToken: (profileId: string) => string;
    readonly nextPasteTokenDescription: string;
    readonly successTitle: string;
    readonly successRuntimePolicy: (modeLabel: string) => string;
    readonly successLaunch: (profileId: string) => string;
    readonly successLaunchDescription: string;
    readonly successContinue: (profileId: string) => string;
    readonly successContinueDescription: string;
    readonly successList: string;
    readonly successListDescription: string;
    readonly successEditProfiles: string;
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
    readonly launchPolicyTitle: string;
    readonly compatLine1: string;
    readonly compatLine2: string;
    readonly safeLine1: string;
    readonly safeLine2: string;
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
    readonly showcaseAllDescription: string;
    readonly showcaseAuthDescription: string;
    readonly showcaseErrorsDescription: string;
    readonly missingBinaryTitle: string;
    readonly missingBinarySummary: string;
    readonly doctorDescription: string;
    readonly previewOnboardingDescription: string;
    readonly unexpectedError: string;
    readonly unknownShowcaseTopic: (topic: string) => string;
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
    readonly claudeExited: string;
    readonly ccoPrefix: (profileId: string) => string;
  };
}

const KO_TEXT: UiText = {
  appDescription: "로컬 멀티 프로필 전환을 위한 Claude Code OAuth 오버레이 런처",
  commandBriefs: {
    runArgProfile: "실행에 사용할 오버레이 프로필 ID. 생략하면 선택 UI를 표시합니다",
    run: "호스트 로그인 또는 선택한 오버레이 프로필로 Claude를 실행합니다",
    host: "현재 호스트 Claude Code 로그인으로 Claude를 실행합니다",
    auth: "오버레이 프로필 토큰을 관리합니다",
    authAddArgProfile: "저장할 프로필 ID. 예: work, backup",
    authAdd: "공식 setup-token 흐름으로 오버레이 프로필을 생성하거나 교체합니다",
    authList: "로컬 오버레이 프로필과 토큰 존재 여부를 표시합니다",
    authRemoveArgProfile: "삭제할 프로필 ID",
    authRemove: "저장된 오버레이 프로필과 로컬 토큰 파일을 삭제합니다",
    doctor: "로컬 저장소, 환경변수 우선순위, Claude 실행 파일 탐지를 점검합니다",
    showcaseArgTopic: "선택 사항: all, auth, help, profiles, errors, doctor, flows",
    showcase: "Claude를 실행하지 않고 cco의 도움말, 오류, 흐름 화면을 미리 봅니다",
  },
  rootHelp: {
    badge: "인증 오버레이",
    summary: "호스트 Claude Code 구성은 그대로 두고, 실행마다 자식 프로세스 인증 토큰만 바꿉니다.",
    quickStartTitle: "빠른 시작",
    quickStartBadge: "권장 흐름",
    quickStartAuthAdd: "공식 Claude setup-token용 로컬 별칭을 만듭니다.",
    quickStartLaunch: "호스트 구성을 유지한 채 work 오버레이 토큰으로 Claude를 실행합니다.",
    quickStartContinue: "Claude의 기본 continue 플래그를 그대로 전달합니다.",
    quickStartShowcase: "Claude를 실행하지 않고 온보딩 화면을 미리 봅니다.",
    commandSurfaceTitle: "명령 표면",
    commandSurfaceProfile: "`cco <profile>`은 오버레이 토큰으로 Claude를 실행합니다.",
    commandSurfaceHost: "`cco host`는 호스트 Claude 로그인으로 실행합니다.",
    commandSurfaceDoctor: "`cco doctor`는 런타임 연결 상태와 환경변수 우선순위를 점검합니다.",
    commandSurfaceShowcase: "`cco showcase [topic]`은 Claude를 실행하지 않고 CLI 화면을 미리 봅니다.",
    localAliasBadge: "로컬 별칭",
    localAliasSummary:
      "프로필은 사용자가 정하는 이름입니다. 예: `work`, `backup`",
  },
  prompts: {
    pickProfile: "실행할 Claude 프로필을 선택하세요",
    hostHint: "호스트 로그인",
    overlayHint: "OAuth 오버레이",
    launchCancelled: "실행을 취소했습니다.",
    pasteToken: (profileId) => `"${profileId}"용 검증된 setup token을 붙여넣으세요`,
    tokenRequired: "토큰이 필요합니다.",
    tokenCancelled: "토큰 입력을 취소했습니다.",
    confirmRemove: (profileId) => `"${profileId}" 프로필과 저장된 토큰을 삭제할까요?`,
    removeCancelled: "프로필 삭제를 취소했습니다.",
    profileEnvPolicy: (profileId) => `"${profileId}"의 하위 프로세스 인증 env 정책`,
    profileEnvSafeLabel: "권장: Claude 하위 프로세스에서 인증 env를 제거",
    profileEnvSafeHint: "더 안전합니다. Bash/hooks/MCP 하위 프로세스가 오버레이 토큰을 읽을 수 없습니다.",
    profileEnvCompatLabel: "호환성: 하위 프로세스에서도 인증 env 유지",
    profileEnvCompatHint: "bypassPermissions 같은 동작이 필요한 신뢰된 로컬 환경에서만 사용하세요.",
    profileEnvCancelled: "프로필 설정을 취소했습니다.",
    permissionOverride: (profileId) =>
      `"${profileId}" 실행에서만 하위 프로세스 인증 env 차단을 해제할까요?`,
    permissionOverrideYes: "이번 실행만 compat mode 허용",
    permissionOverrideNo: "safe mode 유지",
  },
  authAdd: {
    introTitle: "오버레이 프로필 추가",
    introLine1: "이 흐름은 호스트 Claude Code 구성을 그대로 유지합니다.",
    introLine2: "검증된 setup-token만 cco 로컬 홈 아래에 저장됩니다.",
    nextTitle: "다음 단계",
    nextPickMode: "safe mode 또는 compat mode 선택",
    nextPickModeDescription: "Claude 하위 프로세스가 오버레이 인증 env를 볼 수 있는지 결정합니다.",
    nextSetupToken: "claude setup-token",
    nextSetupTokenDescription: "현재 터미널/브라우저 컨텍스트에서 공식 Claude 토큰 발급 흐름을 실행합니다.",
    nextPasteToken: (profileId) => `${profileId}용 토큰 붙여넣기`,
    nextPasteTokenDescription: "숨김 입력으로 토큰을 받고, 저장 전에 검증합니다.",
    successTitle: "오버레이 준비 완료",
    successRuntimePolicy: (modeLabel) => `저장된 실행 정책: ${modeLabel}`,
    successLaunch: (profileId) => `cco ${profileId}`,
    successLaunchDescription: "이 오버레이 토큰과 호스트 구성으로 Claude를 실행합니다.",
    successContinue: (profileId) => `cco ${profileId} -c`,
    successContinueDescription: "같은 오버레이 상태에서 Claude의 continue 플래그를 그대로 전달합니다.",
    successList: "cco auth list",
    successListDescription: "저장된 프로필, 토큰 존재 여부, 실행 정책을 확인합니다.",
    successEditProfiles: "나중에 profiles.json을 직접 수정해 저장된 env 정책을 바꿀 수 있습니다.",
  },
  profiles: {
    title: "프로필",
    overlayCount: (count) => `${count}개 오버레이`,
    introLine1: "공식 Claude setup-token 값을 가리키는 로컬 별칭입니다.",
    introLine2: "host 실행은 호스트 로그인 그대로, overlay 실행은 자식 프로세스 OAuth 토큰만 교체합니다.",
    inventoryTitle: "목록",
    nextStepTitle: "다음 단계",
    createOverlayBadge: "오버레이 생성",
    noOverlay: "저장된 오버레이 프로필이 아직 없습니다.",
    createOverlayDescription: "로컬 별칭을 만들고 검증된 setup-token을 저장합니다.",
    launchAfterSaveDescription: "토큰 저장 후 work 오버레이로 Claude를 실행합니다.",
    editProfilesDescription: "나중에 profiles.json을 직접 수정해 프로필별 env 정책을 바꿀 수 있습니다.",
    readyBadge: (count) => `${count}개 준비됨`,
    nextBulletLaunch: "`cco <profile>`로 오버레이 토큰을 사용해 실행합니다.",
    nextBulletHost: "`cco host`로 호스트 Claude 로그인을 그대로 사용합니다.",
    nextBulletRemove: "`cco auth remove <profile>`로 로컬 별칭을 삭제합니다.",
    nextBulletEditProfiles: (profilesFile) => `${profilesFile} 파일을 직접 수정해 저장된 env 정책을 조정할 수 있습니다.`,
    nextBulletProfilesStored: "프로필은 cco의 로컬 profiles.json 파일에 저장됩니다.",
    hostBadge: "host",
    overlayBadge: "overlay",
    hostLoginBadge: "호스트 로그인",
    storedBadge: "저장됨",
    missingBadge: "없음",
    lastUsedPrefix: "마지막 사용",
  },
  doctor: {
    title: "진단",
    readyBadge: "준비됨",
    checkEnvBadge: "환경 확인 필요",
    readyLine1: "현재 런타임은 host 실행과 프로세스 로컬 인증 오버레이에 사용할 준비가 되어 있습니다.",
    readyLine2: "현재 셸에서는 충돌하는 인증 환경변수가 감지되지 않았습니다.",
    conflictLine1: "실행은 가능하지만, 현재 셸에 경쟁하는 인증 환경변수가 있습니다.",
    conflictLine2: "오버레이 실행을 신뢰하기 전에 아래 충돌 변수를 먼저 확인하세요.",
    snapshotTitle: "런타임 스냅샷",
    suggestedNextStepTitle: "추천 다음 단계",
    suggestedCleanupTitle: "정리 권장",
    launchDescription: "저장된 오버레이 프로필로 Claude를 실행합니다.",
    hostContinueDescription: "호스트 로그인을 유지한 채 Claude의 continue 플래그를 그대로 전달합니다.",
    cleanup1: "경쟁하는 인증 환경변수를 해제하거나 새 셸에서 다시 실행하세요.",
    cleanup2: "`cco doctor`를 다시 실행해 env 스냅샷이 깨끗한지 확인하세요.",
    cleanup3: "API 키와 OAuth env를 섞기보다는 `cco auth add <profile>` + `cco <profile>` 조합을 권장합니다.",
    defaultHostConfig: "(기본 Claude 호스트 구성)",
    launchMode: "호스트 구성 + 프로세스 로컬 인증 오버레이",
    noneDetected: "감지되지 않음",
  },
  permissionMode: {
    safeMode: "safe mode",
    compatMode: "compat mode",
    warningTitle: "권한 모드 경고",
    warningLine1: "`--permission-mode bypassPermissions`는 현재 프로필의 safe mode env 정책과 충돌합니다.",
    warningLine2: "safe mode를 유지하면 Claude가 permission mode를 default로 되돌릴 가능성이 높습니다.",
    choicesTitle: "선택지",
    choiceCompat: "이번 실행만 compat mode로 내려 bypassPermissions를 유지합니다.",
    choiceSafe: "하위 프로세스가 오버레이 인증 env를 읽지 못하게 하려면 safe mode를 유지합니다.",
    launchPolicyTitle: "이번 실행 정책",
    compatLine1: "이번 실행에서는 `CLAUDE_CODE_SUBPROCESS_ENV_SCRUB=0`을 임시로 사용합니다.",
    compatLine2: "저장된 프로필 값은 바뀌지 않습니다.",
    safeLine1: "이번 실행에서는 `CLAUDE_CODE_SUBPROCESS_ENV_SCRUB=1`을 유지합니다.",
    safeLine2: "Claude가 `bypassPermissions`를 기본 권한 모드로 강등할 수 있습니다.",
  },
  errors: {
    problemTitle: "문제",
    nextStepTitle: "다음 단계",
    unknownProfileTitle: (profileId) => `알 수 없는 프로필: ${profileId}`,
    unknownProfileSummary: "먼저 로컬 별칭을 만들거나, 저장된 오버레이 프로필을 확인하세요.",
    createOverlayDescription: "새 오버레이 프로필을 만들고 검증합니다.",
    inspectProfilesDescription: "저장된 host/overlay 프로필을 확인합니다.",
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
    showcaseAllDescription: "전체 UI 표면을 미리 봅니다.",
    showcaseAuthDescription: "토큰 온보딩 패널만 미리 봅니다.",
    showcaseErrorsDescription: "복구/오류 상태만 미리 봅니다.",
    missingBinaryTitle: "Claude 실행 파일을 찾지 못해 실행할 수 없습니다.",
    missingBinarySummary: "설정되었거나 자동 탐지된 Claude 실행 파일이 현재 환경에 없습니다.",
    doctorDescription: "실행 파일 탐지, host config, env 우선순위를 확인합니다.",
    previewOnboardingDescription: "Claude를 실행하지 않고 온보딩 흐름을 미리 봅니다.",
    unexpectedError: "예상하지 못한 오류입니다.",
    unknownShowcaseTopic: (topic) =>
      `알 수 없는 showcase 주제 "${topic}". 사용 가능: all, auth, help, profiles, errors, doctor, flows`,
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
    flowLaunchDescription: "호스트 구성은 그대로 두고, 자식 프로세스에는 work OAuth 토큰만 주입해 Claude를 실행합니다.",
    flowContinueDescription: "같은 인증 오버레이 상태에서 Claude의 continue 플래그를 그대로 전달합니다.",
    flowHostDescription: "호스트 로그인을 유지한 채 Claude의 resume 인자를 그대로 전달합니다.",
  },
  misc: {
    profileConfigurationCancelled: "프로필 설정을 취소했습니다.",
    noChangesMade: "변경된 내용이 없습니다.",
    removedProfile: (profileId) => `"${profileId}" 프로필을 삭제했습니다.`,
    claudeExited: "Claude가 종료되었습니다.",
    ccoPrefix: (profileId) => `cco ${profileId}`,
  },
};

const EN_TEXT: UiText = {
  appDescription: "Claude Code OAuth overlay launcher for local multi-profile switching",
  commandBriefs: {
    runArgProfile: "Overlay profile id to use, or omit for profile picker",
    run: "Launch Claude with the host login or a selected overlay profile",
    host: "Launch Claude with the host Claude Code login",
    auth: "Manage overlay profile tokens",
    authAddArgProfile: "Profile id to save, such as work or backup",
    authAdd: "Create or replace an overlay profile using the official setup-token flow",
    authList: "List local overlay profiles and token presence",
    authRemoveArgProfile: "Profile id to delete",
    authRemove: "Delete a saved overlay profile and its local token file",
    doctor: "Check local storage, env precedence, and Claude binary resolution",
    showcaseArgTopic: "Optional showcase topic: all, auth, help, profiles, errors, doctor, or flows",
    showcase: "Preview cco help, errors, and flow output without launching Claude",
  },
  rootHelp: {
    badge: "auth overlay",
    summary: "Keep the host Claude Code config intact and swap only the child-process auth token per launch.",
    quickStartTitle: "Quick Start",
    quickStartBadge: "primary path",
    quickStartAuthAdd: "Create a local alias for an official Claude setup-token.",
    quickStartLaunch: "Launch Claude with the work overlay token while keeping host config intact.",
    quickStartContinue: "Pass Claude's native continue flag through unchanged.",
    quickStartShowcase: "Preview the onboarding panels without launching Claude.",
    commandSurfaceTitle: "Command Surface",
    commandSurfaceProfile: "`cco <profile>` launches Claude with an overlay token.",
    commandSurfaceHost: "`cco host` launches with the host Claude login.",
    commandSurfaceDoctor: "`cco doctor` inspects runtime wiring and env precedence.",
    commandSurfaceShowcase: "`cco showcase [topic]` previews the CLI surface without launching Claude.",
    localAliasBadge: "local alias",
    localAliasSummary: "Profiles are names you choose, such as `work` or `backup`.",
  },
  prompts: {
    pickProfile: "Pick the Claude profile to launch",
    hostHint: "host login",
    overlayHint: "oauth overlay",
    launchCancelled: "Launch cancelled.",
    pasteToken: (profileId) => `Paste the verified setup token for "${profileId}"`,
    tokenRequired: "Token is required.",
    tokenCancelled: "Token capture cancelled.",
    confirmRemove: (profileId) => `Remove profile "${profileId}" and delete its stored token?`,
    removeCancelled: "Profile removal cancelled.",
    profileEnvPolicy: (profileId) => `Subprocess auth env policy for "${profileId}"`,
    profileEnvSafeLabel: "Recommended: scrub auth env in Claude child subprocesses",
    profileEnvSafeHint: "Safer. Bash/hooks/MCP subprocesses cannot read the overlay token.",
    profileEnvCompatLabel: "Compatibility: keep auth env visible to child subprocesses",
    profileEnvCompatHint: "Use only for trusted local workflows that need bypassPermissions-like behavior.",
    profileEnvCancelled: "Profile configuration cancelled.",
    permissionOverride: (profileId) =>
      `Allow "${profileId}" to disable subprocess auth-env scrubbing for this launch?`,
    permissionOverrideYes: "Temporarily allow compat mode",
    permissionOverrideNo: "Keep safe mode",
  },
  authAdd: {
    introTitle: "Add Overlay Profile",
    introLine1: "This flow keeps the host Claude Code config intact.",
    introLine2: "Only a verified setup-token for this local alias will be stored under cco's local home.",
    nextTitle: "What Happens Next",
    nextPickMode: "pick safe or compatibility mode",
    nextPickModeDescription: "Controls whether Claude child subprocesses can read the overlay auth env.",
    nextSetupToken: "claude setup-token",
    nextSetupTokenDescription: "Runs the official Claude token flow in the current terminal/browser context.",
    nextPasteToken: (profileId) => `paste token for ${profileId}`,
    nextPasteTokenDescription: "The token is captured with hidden input and verified before it is saved.",
    successTitle: "Overlay Ready",
    successRuntimePolicy: (modeLabel) => `Saved runtime policy: ${modeLabel}.`,
    successLaunch: (profileId) => `cco ${profileId}`,
    successLaunchDescription: "Launch Claude with this overlay token and the host config.",
    successContinue: (profileId) => `cco ${profileId} -c`,
    successContinueDescription: "Use the same overlay and pass Claude's native continue flag through unchanged.",
    successList: "cco auth list",
    successListDescription: "Inspect saved profiles, token presence, and runtime policy.",
    successEditProfiles: "Edit profiles.json directly later to adjust the stored env policy.",
  },
  profiles: {
    title: "Profiles",
    overlayCount: (count) => `${count} overlay`,
    introLine1: "Local aliases for official Claude setup-token values.",
    introLine2: "Host launches keep the host login; overlay launches swap only the child-process OAuth token.",
    inventoryTitle: "Inventory",
    nextStepTitle: "Next Step",
    createOverlayBadge: "create overlay",
    noOverlay: "No overlay profiles are stored yet.",
    createOverlayDescription: "Create a local alias and save a verified setup-token.",
    launchAfterSaveDescription: "Launch Claude with the work overlay once the token is saved.",
    editProfilesDescription: "Edit profiles.json directly later to adjust per-profile env policy.",
    readyBadge: (count) => `${count} ready`,
    nextBulletLaunch: "Use `cco <profile>` to launch with an overlay token.",
    nextBulletHost: "Use `cco host` to launch with the host Claude login.",
    nextBulletRemove: "Use `cco auth remove <profile>` to delete a local alias.",
    nextBulletEditProfiles: (profilesFile) => `Edit ${profilesFile} directly if you want to tune a saved profile's env policy.`,
    nextBulletProfilesStored: "Profiles are stored in cco's local profiles.json file.",
    hostBadge: "host",
    overlayBadge: "overlay",
    hostLoginBadge: "host login",
    storedBadge: "stored",
    missingBadge: "missing",
    lastUsedPrefix: "last used",
  },
  doctor: {
    title: "Doctor",
    readyBadge: "ready",
    checkEnvBadge: "check env",
    readyLine1: "Runtime looks ready for host launches and process-local auth overlays.",
    readyLine2: "No conflicting auth environment variables were detected in the current shell.",
    conflictLine1: "Runtime is launchable, but the current shell has competing auth environment variables.",
    conflictLine2: "Review the conflicting variables below before trusting an overlay launch.",
    snapshotTitle: "Runtime Snapshot",
    suggestedNextStepTitle: "Suggested Next Step",
    suggestedCleanupTitle: "Suggested Cleanup",
    launchDescription: "Launch Claude with a saved overlay profile.",
    hostContinueDescription: "Keep the host login and pass Claude's native continue flag through unchanged.",
    cleanup1: "Unset the competing auth variables or start a clean shell.",
    cleanup2: "Run `cco doctor` again to confirm the env snapshot is clean.",
    cleanup3: "Prefer `cco auth add <profile>` plus `cco <profile>` over mixing API and OAuth env vars.",
    defaultHostConfig: "(default Claude host config)",
    launchMode: "host config + process-local auth overlay",
    noneDetected: "none detected",
  },
  permissionMode: {
    safeMode: "safe mode",
    compatMode: "compat mode",
    warningTitle: "Permission Mode Warning",
    warningLine1: "`--permission-mode bypassPermissions` conflicts with this profile's safe-mode env policy.",
    warningLine2: "If you keep safe mode, Claude will usually force permission mode back to default.",
    choicesTitle: "Choices",
    choiceCompat: "Allow compat mode for this launch only to keep bypassPermissions intact.",
    choiceSafe: "Keep safe mode if you do not want child subprocesses to read the overlay auth env.",
    launchPolicyTitle: "Launch Policy",
    compatLine1: "This launch will set `CLAUDE_CODE_SUBPROCESS_ENV_SCRUB=0` temporarily.",
    compatLine2: "The saved profile stays unchanged.",
    safeLine1: "This launch will keep `CLAUDE_CODE_SUBPROCESS_ENV_SCRUB=1`.",
    safeLine2: "Claude may downgrade `bypassPermissions` to the default permission mode.",
  },
  errors: {
    problemTitle: "Problem",
    nextStepTitle: "Next Step",
    unknownProfileTitle: (profileId) => `Unknown profile: ${profileId}`,
    unknownProfileSummary: "Create the local alias first, or inspect the saved overlay profiles.",
    createOverlayDescription: "Create and verify a new overlay profile.",
    inspectProfilesDescription: "Inspect the saved host and overlay profiles.",
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
    showcaseAllDescription: "Preview the full UI surface.",
    showcaseAuthDescription: "Preview the token onboarding panels.",
    showcaseErrorsDescription: "Preview the recovery/error states only.",
    missingBinaryTitle: "Could not launch Claude because the binary was not found.",
    missingBinarySummary: "The configured or discovered Claude executable is missing from the current environment.",
    doctorDescription: "Inspect binary resolution, host config, and env precedence.",
    previewOnboardingDescription: "Preview the onboarding flow without launching Claude.",
    unexpectedError: "Unexpected error.",
    unknownShowcaseTopic: (topic) =>
      `Unknown showcase topic "${topic}". Use one of: all, auth, help, profiles, errors, doctor, flows.`,
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
    flowLaunchDescription: "Launches Claude with host config intact and injects only the work OAuth token into the child process.",
    flowContinueDescription: "Uses the same auth overlay while passing Claude's native continue flag through unchanged.",
    flowHostDescription: "Keeps the host login and passes native resume arguments through unchanged.",
  },
  misc: {
    profileConfigurationCancelled: "Profile configuration cancelled.",
    noChangesMade: "No changes made.",
    removedProfile: (profileId) => `Removed profile "${profileId}".`,
    claudeExited: "Claude exited.",
    ccoPrefix: (profileId) => `cco ${profileId}`,
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
    noCommandRegisteredForInput: (input) => `입력 "${input}"에 해당하는 명령을 찾지 못했습니다.`,
    noTextAvailableForLocale: (localeName) =>
      `로케일 "${localeName}"에 사용할 텍스트가 없습니다.`,
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
