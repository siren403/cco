import React, { type ReactNode, useState } from "react";
import { Box, Text, useApp, useInput, useWindowSize } from "ink";
import type { IsolateHomeStatus } from "../../core/services/isolate-home.ts";
import type { OverlayProfile, Profile } from "../../core/model/profile.ts";
import { getUiText, type AppLocale } from "../../i18n/index.ts";
import {
  buildDoctorPageModel,
  type DoctorPageData,
} from "../models/doctor-page.ts";
import { InkBulletList } from "./components/bullet-list.ts";
import { InkCommandList } from "./components/command-list.ts";
import { InkKeyValueList } from "./components/key-value-list.ts";
import { InkPanel, type InkTone } from "./components/panel.ts";

const h = React.createElement;
const dimColorProps = { dimColor: true } as const;

export type ControlPanelAppearance = "stable" | "rich";

type ControlPanelView =
  | "dashboard"
  | "explain"
  | "doctor"
  | "status"
  | "confirm"
  | "help";
type ControlPanelActionId =
  | "continue"
  | "run"
  | "host"
  | "explain"
  | "doctor"
  | "status"
  | "fresh"
  | "clean"
  | "quit";

export interface HostLinkEntryStatus {
  readonly name: string;
  readonly sourcePath: string;
  readonly targetPath: string;
  readonly state: "linked" | "present" | "missing-source" | "missing-target";
}

interface ControlPanelActionItem {
  readonly id: ControlPanelActionId;
  readonly label: string;
  readonly hint?: string;
  readonly disabled?: boolean;
  readonly dangerous?: boolean;
}

interface ControlPanelTheme {
  readonly selectedMarker: string;
  readonly idleMarker: string;
  readonly dangerMarker: string;
  readonly statusReadyPrefix: string;
  readonly statusMissingPrefix: string;
  readonly statusBrokenPrefix: string;
  readonly selectedRowInverse: boolean;
}

interface PendingFreshAction {
  readonly profileId: string;
  readonly clean: boolean;
}

type ControlPanelLayout =
  | {
      readonly kind: "wide";
      readonly columns: number;
      readonly profileWidth: number;
      readonly actionWidth: number;
      readonly detailWidth: number;
    }
  | {
      readonly kind: "medium";
      readonly columns: number;
      readonly leftWidth: number;
      readonly detailWidth: number;
    }
  | {
      readonly kind: "narrow";
      readonly columns: number;
    };

export interface ControlPanelModel {
  readonly profiles: readonly Profile[];
  readonly tokenPresence: ReadonlyMap<string, boolean>;
  readonly isolateStatuses: ReadonlyMap<string, IsolateHomeStatus>;
  readonly hostLinkStatuses: ReadonlyMap<string, readonly HostLinkEntryStatus[]>;
  readonly profilesFile?: string;
  readonly cwd: string;
  readonly doctorData: DoctorPageData;
  readonly locale: AppLocale;
}

export type ControlPanelOutcome =
  | {
      readonly kind: "launch";
      readonly profileId: string;
      readonly claudeArgs?: readonly string[];
    }
  | {
      readonly kind: "fresh";
      readonly profileId: string;
      readonly clean: boolean;
      readonly confirmed?: boolean;
    }
  | {
      readonly kind: "reload";
    }
  | {
      readonly kind: "quit";
    };

export interface ControlPanelInkScreenProps {
  readonly model: ControlPanelModel;
  readonly appearance?: ControlPanelAppearance;
  readonly repaintEpoch?: number;
  readonly onSubmit: (outcome: ControlPanelOutcome) => void;
}

export function ControlPanelInkScreen(props: ControlPanelInkScreenProps): ReactNode {
  const text = getUiText(props.model.locale);
  const { exit } = useApp();
  const { columns, rows } = useWindowSize();
  const [view, setView] = useState<ControlPanelView>("dashboard");
  const [profileIndex, setProfileIndex] = useState(0);
  const [actionIndex, setActionIndex] = useState(0);
  const [filterActive, setFilterActive] = useState(false);
  const [filter, setFilter] = useState("");
  const [pendingFreshAction, setPendingFreshAction] = useState<PendingFreshAction>();
  const [confirmIndex, setConfirmIndex] = useState(0);

  const appearance = props.appearance ?? "stable";
  const theme = resolveControlPanelTheme(appearance);
  const profiles = normalizeProfiles(props.model.profiles);
  const filteredProfiles = filterProfiles(profiles, filter);
  const visibleProfiles = filteredProfiles.length > 0 ? filteredProfiles : profiles;
  const selectedProfile = visibleProfiles[wrapIndex(profileIndex, visibleProfiles.length)]!;
  const selectedOverlay = isOverlayProfile(selectedProfile) ? selectedProfile : undefined;
  const actions = buildActions(text, selectedOverlay);
  const selectedAction = actions[wrapIndex(actionIndex, actions.length)]!;
  const maxProfileRows = Math.max(3, rows - 11);
  const visibleProfileWindow = windowAround(
    visibleProfiles,
    profileIndex,
    maxProfileRows,
  );
  const viewportColumns = resolveViewportColumns(columns);
  const layout = resolveLayout(viewportColumns);

  useInput((input, key) => {
    if (pendingFreshAction) {
      if (input === "y" || input === "Y") {
        submitFreshAction(pendingFreshAction, props.onSubmit, exit);
        return;
      }

      if (input === "n" || input === "N" || input === "q" || key.escape) {
        setPendingFreshAction(undefined);
        setConfirmIndex(0);
        setView("dashboard");
        return;
      }

      if (key.leftArrow || key.upArrow) {
        setConfirmIndex((current) => wrapIndex(current - 1, 2));
        return;
      }

      if (key.rightArrow || key.downArrow || key.tab) {
        setConfirmIndex((current) => wrapIndex(current + 1, 2));
        return;
      }

      if (key.return) {
        if (confirmIndex === 1) {
          submitFreshAction(pendingFreshAction, props.onSubmit, exit);
          return;
        }

        setPendingFreshAction(undefined);
        setConfirmIndex(0);
        setView("dashboard");
      }
      return;
    }

    if (filterActive) {
      if (key.escape) {
        setFilterActive(false);
        setFilter("");
        setProfileIndex(0);
        return;
      }

      if (key.return) {
        setFilterActive(false);
        return;
      }

      if (key.backspace || key.delete) {
        setFilter((current) => current.slice(0, -1));
        setProfileIndex(0);
        return;
      }

      if (input && !key.ctrl && !key.meta && input.length === 1) {
        setFilter((current) => `${current}${input}`);
        setProfileIndex(0);
      }
      return;
    }

    if (input === "q" || key.escape) {
      submitAndExit({ kind: "quit" }, props.onSubmit, exit);
      return;
    }

    if (input === "r") {
      submitAndExit({ kind: "reload" }, props.onSubmit, exit);
      return;
    }

    if (input === "?") {
      setView("help");
      return;
    }

    if (input === "/") {
      setFilterActive(true);
      return;
    }

    if (input === "x") {
      setView("explain");
      return;
    }

    if (input === "d") {
      setView("doctor");
      return;
    }

    if (input === "s") {
      setView("status");
      return;
    }

    if (key.upArrow) {
      setActionIndex((current) => wrapIndex(current - 1, actions.length));
      return;
    }

    if (key.downArrow) {
      setActionIndex((current) => wrapIndex(current + 1, actions.length));
      return;
    }

    if (key.leftArrow) {
      setProfileIndex((current) => wrapIndex(current - 1, visibleProfiles.length));
      setView("dashboard");
      setPendingFreshAction(undefined);
      return;
    }

    if (key.rightArrow || key.tab) {
      setProfileIndex((current) => wrapIndex(current + 1, visibleProfiles.length));
      setView("dashboard");
      setPendingFreshAction(undefined);
      return;
    }

    if (key.return) {
      handleAction(
        selectedAction,
        selectedProfile,
        selectedOverlay,
        setView,
        setPendingFreshAction,
        setConfirmIndex,
        props.onSubmit,
        exit,
      );
    }
  });

  return h(
    Box,
    { flexDirection: "column" },
    renderHeader({
      model: props.model,
      profile: selectedProfile,
      appearance,
      filter,
      filterActive,
      columns: viewportColumns,
    }),
    renderMainLayout({
      model: props.model,
      layout,
      profiles: visibleProfileWindow.items,
      offset: visibleProfileWindow.offset,
      selectedProfileIndex: wrapIndex(profileIndex, visibleProfiles.length),
      profileEmpty: filteredProfiles.length === 0 && filter.length > 0,
      actions,
      selectedActionIndex: wrapIndex(actionIndex, actions.length),
      view,
      profile: selectedProfile,
      overlay: selectedOverlay,
      pendingFreshAction,
      confirmIndex,
      appearance,
      theme,
    }),
    renderFooter({
      locale: props.model.locale,
      filter,
      filterActive,
      columns: viewportColumns,
      repaintEpoch: props.repaintEpoch ?? 0,
      confirmActive: pendingFreshAction != null,
    }),
  );
}

function buildActions(
  text: ReturnType<typeof getUiText>,
  selectedOverlay: OverlayProfile | undefined,
): readonly ControlPanelActionItem[] {
  const overlayOnly = !selectedOverlay;

  return [
    {
      id: "continue",
      label: text.controlPanel.actionContinue,
      hint: text.controlPanel.actionContinueHint,
    },
    {
      id: "run",
      label: text.controlPanel.actionRun,
      hint: text.controlPanel.actionRunHint,
    },
    {
      id: "host",
      label: text.controlPanel.actionHost,
      hint: text.controlPanel.actionHostHint,
    },
    {
      id: "explain",
      label: text.controlPanel.actionExplain,
      hint: text.controlPanel.actionExplainHint,
    },
    {
      id: "doctor",
      label: text.controlPanel.actionDoctor,
      hint: text.controlPanel.actionDoctorHint,
    },
    {
      id: "status",
      label: text.controlPanel.actionStatus,
      hint: overlayOnly
        ? text.controlPanel.overlayActionDisabled
        : text.controlPanel.actionStatusHint,
      disabled: overlayOnly,
    },
    {
      id: "fresh",
      label: text.controlPanel.actionFresh,
      hint: overlayOnly
        ? text.controlPanel.overlayActionDisabled
        : text.controlPanel.actionFreshHint,
      disabled: overlayOnly,
      dangerous: true,
    },
    {
      id: "clean",
      label: text.controlPanel.actionClean,
      hint: overlayOnly
        ? text.controlPanel.overlayActionDisabled
        : text.controlPanel.actionCleanHint,
      disabled: overlayOnly,
      dangerous: true,
    },
    {
      id: "quit",
      label: text.controlPanel.actionQuit,
      hint: "q",
    },
  ];
}

function renderHeader(props: {
  readonly model: ControlPanelModel;
  readonly profile: Profile;
  readonly appearance: ControlPanelAppearance;
  readonly filter: string;
  readonly filterActive: boolean;
  readonly columns: number;
}): ReactNode {
  const text = getUiText(props.model.locale);
  const theme = resolveControlPanelTheme(props.appearance);
  const tokenBadge = resolveTokenBadge(
    props.profile,
    props.model.tokenPresence,
    props.model.locale,
  );
  const isolateBadge = resolveIsolateBadge(
    props.profile,
    props.model.isolateStatuses,
    props.model.locale,
    theme,
  );
  const hostLinks = summarizeHostLinks(
    props.profile,
    props.model.hostLinkStatuses,
    props.model.locale,
  );
  const session = summarizeSession(props.profile, props.model.isolateStatuses, props.model.locale);
  const modeBadge = props.appearance === "rich"
    ? text.controlPanel.richModeBadge
    : text.controlPanel.stableModeBadge;
  const filterSuffix = props.filter
    ? `  filter=${props.filterActive ? "/" : ""}${props.filter}`
    : "";

  return h(
    Box,
    {
      borderStyle: "round",
      borderColor: props.appearance === "rich" ? "magenta" : "cyan",
      paddingX: 1,
      marginBottom: 1,
      flexDirection: "column",
      width: props.columns,
    },
    h(
      Box,
      { flexDirection: "row" },
      renderBrand(props.appearance),
      h(Text, dimColorProps, "  Profile Control Center"),
      h(Text, { color: "gray", wrap: "truncate-end" }, `  [${modeBadge}]${filterSuffix}`),
    ),
    h(
      Text,
      { wrap: "truncate-end" },
      `active=${props.profile.id}  auth=${tokenBadge}  isolate=${isolateBadge}  host-links=${hostLinks.label}  session=${session}`,
    ),
  );
}

function renderMainLayout(props: {
  readonly model: ControlPanelModel;
  readonly layout: ControlPanelLayout;
  readonly profiles: readonly Profile[];
  readonly offset: number;
  readonly selectedProfileIndex: number;
  readonly profileEmpty: boolean;
  readonly actions: readonly ControlPanelActionItem[];
  readonly selectedActionIndex: number;
  readonly view: ControlPanelView;
  readonly profile: Profile;
  readonly overlay?: OverlayProfile;
  readonly pendingFreshAction?: PendingFreshAction;
  readonly confirmIndex: number;
  readonly appearance: ControlPanelAppearance;
  readonly theme: ControlPanelTheme;
}): ReactNode {
  if (props.layout.kind === "wide") {
    return h(
      Box,
      { flexDirection: "row", width: props.layout.columns },
      renderProfilesPanel({
        ...props,
        width: props.layout.profileWidth,
        marginRight: 1,
        marginBottom: 0,
      }),
      renderActionsPanel({
        ...props,
        width: props.layout.actionWidth,
        marginRight: 1,
        marginBottom: 0,
      }),
      renderDetailPanel({ ...props, width: props.layout.detailWidth }),
    );
  }

  if (props.layout.kind === "medium") {
    return h(
      Box,
      { flexDirection: "row", width: props.layout.columns },
      h(
        Box,
        { flexDirection: "column", width: props.layout.leftWidth, marginRight: 1 },
        renderProfilesPanel({
          ...props,
          width: props.layout.leftWidth,
          marginRight: 0,
          marginBottom: 1,
        }),
        renderActionsPanel({
          ...props,
          width: props.layout.leftWidth,
          marginRight: 0,
          marginBottom: 0,
        }),
      ),
      renderDetailPanel({ ...props, width: props.layout.detailWidth }),
    );
  }

  return h(
    Box,
    { flexDirection: "column", width: props.layout.columns },
    renderProfilesPanel({
      ...props,
      width: props.layout.columns,
      marginRight: 0,
      marginBottom: 1,
    }),
    renderActionsPanel({
      ...props,
      width: props.layout.columns,
      marginRight: 0,
      marginBottom: 1,
    }),
    renderDetailPanel({ ...props, width: props.layout.columns }),
  );
}

function renderProfilesPanel(props: {
  readonly model: ControlPanelModel;
  readonly profiles: readonly Profile[];
  readonly offset: number;
  readonly selectedProfileIndex: number;
  readonly profileEmpty: boolean;
  readonly width?: number;
  readonly marginRight: number;
  readonly marginBottom: number;
  readonly theme: ControlPanelTheme;
}): ReactNode {
  const text = getUiText(props.model.locale);
  const rows = props.profileEmpty
    ? [
        h(
          Text,
          { key: "empty", dimColor: true },
          text.controlPanel.noFilterResults,
        ),
      ]
    : props.profiles.map((profile, localIndex) => {
        const index = props.offset + localIndex;
        const selected = index === props.selectedProfileIndex;
        const tokenBadge = resolveTokenBadge(profile, props.model.tokenPresence, props.model.locale);
        const isolateBadge = resolveIsolateBadge(
          profile,
          props.model.isolateStatuses,
          props.model.locale,
          props.theme,
        );
        const marker = selected ? props.theme.selectedMarker : props.theme.idleMarker;

        return h(
          Text,
          {
            key: profile.id,
            color: selected ? "cyan" : undefined,
            inverse: selected && props.theme.selectedRowInverse,
            wrap: "truncate-end",
          },
          `${marker} ${profile.id} [${tokenBadge}] [${isolateBadge}]`,
        );
      });

  return h(
    InkPanel,
    {
      title: text.controlPanel.profileColumnTitle,
      tone: "dim",
      width: props.width,
      marginRight: props.marginRight,
      marginBottom: props.marginBottom,
    },
    ...rows,
  );
}

function renderActionsPanel(props: {
  readonly model: ControlPanelModel;
  readonly actions: readonly ControlPanelActionItem[];
  readonly selectedActionIndex: number;
  readonly width?: number;
  readonly marginRight: number;
  readonly marginBottom: number;
  readonly theme: ControlPanelTheme;
}): ReactNode {
  const text = getUiText(props.model.locale);

  return h(
    InkPanel,
    {
      title: text.controlPanel.actionColumnTitle,
      tone: "accent",
      width: props.width,
      marginRight: props.marginRight,
      marginBottom: props.marginBottom,
    },
    ...props.actions.map((action, index) => {
      const selected = index === props.selectedActionIndex;
      const marker = selected ? props.theme.selectedMarker : props.theme.idleMarker;
      const dangerMarker = action.dangerous ? `${props.theme.dangerMarker} ` : "";

      return h(
        Box,
        {
          key: action.id,
          flexDirection: "column",
          marginBottom: 1,
        },
        h(
          Text,
          {
            color: resolveActionColor(action, selected),
            inverse: selected && !action.disabled && props.theme.selectedRowInverse,
            wrap: "truncate-end",
          },
          `${marker} ${dangerMarker}${action.label}`,
        ),
        action.hint
          ? h(Text, { dimColor: true, wrap: "truncate-end" }, `  ${action.hint}`)
          : undefined,
      );
    }),
  );
}

function resolveActionColor(
  action: ControlPanelActionItem,
  selected: boolean,
): "gray" | "cyan" | "yellow" | undefined {
  if (action.disabled) {
    return "gray";
  }

  if (action.dangerous) {
    return "yellow";
  }

  return selected ? "cyan" : undefined;
}

function resolveConfirmChoiceColor(
  index: number,
  confirmIndex: number,
): "cyan" | "yellow" | undefined {
  if (index === 1) {
    return "yellow";
  }

  return confirmIndex === index ? "cyan" : undefined;
}

function renderDetailPanel(props: {
  readonly model: ControlPanelModel;
  readonly view: ControlPanelView;
  readonly profile: Profile;
  readonly overlay?: OverlayProfile;
  readonly pendingFreshAction?: PendingFreshAction;
  readonly confirmIndex: number;
  readonly appearance: ControlPanelAppearance;
  readonly width: number;
  readonly theme: ControlPanelTheme;
}): ReactNode {
  switch (props.view) {
    case "explain":
      return renderExplainDetail(props.model, props.profile, props.overlay, props.width);
    case "doctor":
      return renderDoctorDetail(props.model, props.width);
    case "status":
      return renderStatusDetail(props.model, props.overlay, props.width);
    case "confirm":
      return renderConfirmDetail(
        props.model,
        props.pendingFreshAction,
        props.confirmIndex,
        props.theme,
        props.width,
      );
    case "help":
      return renderHelpDetail(props.model.locale, props.appearance, props.width);
    case "dashboard":
    default:
      return renderDashboardDetail(
        props.model,
        props.profile,
        props.overlay,
        props.appearance,
        props.width,
      );
  }
}

function renderDashboardDetail(
  model: ControlPanelModel,
  profile: Profile,
  overlay: OverlayProfile | undefined,
  appearance: ControlPanelAppearance,
  width: number,
): ReactNode {
  const text = getUiText(model.locale);
  const tokenBadge = resolveTokenBadge(profile, model.tokenPresence, model.locale);
  const theme = resolveControlPanelTheme(appearance);
  const isolateBadge = resolveIsolateBadge(profile, model.isolateStatuses, model.locale, theme);
  const launchCommand = profile.id === "host" ? "cco host" : `cco ${profile.id}`;
  const continueCommand = profile.id === "host" ? "cco host -c" : `cco ${profile.id} -c`;
  const status = overlay ? model.isolateStatuses.get(overlay.id) : undefined;
  const hostLinks = summarizeHostLinks(profile, model.hostLinkStatuses, model.locale);

  return h(
    InkPanel,
    {
      title: text.controlPanel.detailColumnTitle,
      tone: "ok",
      width,
    },
    ...InkKeyValueList({
      entries: [
        { label: "profile", value: profile.id, tone: "accent" },
        {
          label: "launch",
          value: continueCommand,
          tone: "accent",
        },
        {
          label: "auth",
          value: tokenBadge,
          tone: profile.kind === "host" || model.tokenPresence.get(profile.id) ? "ok" : "warn",
        },
        {
          label: "claude-home",
          value: resolveClaudeHomeSummary(profile, status, text),
          tone: status ? healthTone(status.health) : "dim",
        },
        {
          label: "config",
          value: resolveConfigSummary(profile, status, text),
        },
        {
          label: "isolate",
          value: isolateBadge,
          tone: status ? healthTone(status.health) : "dim",
        },
        {
          label: "host-links",
          value: hostLinks.label,
          tone: hostLinks.tone,
        },
        {
          label: "session",
          value: summarizeSession(profile, model.isolateStatuses, model.locale),
          tone: profile.kind === "host" || status?.health === "ready" ? "ok" : "dim",
        },
        {
          label: "last-used",
          value: overlay?.lastUsedAt ?? text.profiles.missingBadge,
          tone: overlay?.lastUsedAt ? "dim" : "warn",
        },
      ],
    }),
    h(Text, null, ""),
    ...InkCommandList({
      entries: [
        {
          command: continueCommand,
          description: text.controlPanel.actionContinue,
        },
        {
          command: launchCommand,
          description: text.controlPanel.actionRun,
        },
      ],
    }),
  );
}

function resolveClaudeHomeSummary(
  profile: Profile,
  status: IsolateHomeStatus | undefined,
  text: ReturnType<typeof getUiText>,
): string {
  if (profile.kind === "host") {
    return text.controlPanel.hostClaudeHome;
  }

  return status?.homeDir ?? text.profiles.missingBadge;
}

function resolveConfigSummary(
  profile: Profile,
  status: IsolateHomeStatus | undefined,
  text: ReturnType<typeof getUiText>,
): string {
  if (profile.kind === "host") {
    return text.controlPanel.hostConfigSummary;
  }

  if (status?.manifest?.seedMode === "clean") {
    return text.controlPanel.cleanConfigSummary;
  }

  return text.controlPanel.hostLinkedConfigSummary;
}

function renderExplainDetail(
  model: ControlPanelModel,
  profile: Profile,
  overlay: OverlayProfile | undefined,
  width: number,
): ReactNode {
  const text = getUiText(model.locale);
  const status = overlay ? model.isolateStatuses.get(overlay.id) : undefined;
  const links = overlay ? model.hostLinkStatuses.get(overlay.id) ?? [] : [];
  const visibleLinks = links.filter((entry) => entry.state !== "missing-source").slice(0, 8);

  return h(
    InkPanel,
    {
      title: text.controlPanel.explainColumnTitle,
      tone: "accent",
      badge: profile.id,
      width,
    },
    ...InkBulletList({
      items: [
        profile.kind === "host"
          ? text.controlPanel.explainHostAuth
          : text.controlPanel.explainProfileAuth,
        profile.kind === "host"
          ? text.controlPanel.explainHostHome
          : text.controlPanel.explainIsolateHome(status?.homeDir ?? text.profiles.missingBadge),
        profile.kind === "host"
          ? text.controlPanel.explainHostSession
          : text.controlPanel.explainSessionLink(model.cwd),
      ],
    }),
    h(Text, null, ""),
    ...InkKeyValueList({
      entries: [
        {
          label: "source-config",
          value:
            status?.manifest?.sourceConfigDir ??
            overlay?.isolate?.source.configDir ??
            text.profiles.missingBadge,
        },
        {
          label: "manifest",
          value: status?.manifestFile ?? text.profiles.missingBadge,
        },
        {
          label: "seed-mode",
          value: status?.manifest?.seedMode ?? text.profiles.missingBadge,
        },
      ],
    }),
    h(Text, null, ""),
    ...visibleLinks.map((entry) =>
      h(
        Text,
        {
          key: entry.name,
          color: hostLinkColor(entry.state),
          wrap: "truncate-end",
        },
        `${entry.name}: ${hostLinkLabel(entry.state, model.locale)}`,
      ),
    ),
  );
}

function renderDoctorDetail(model: ControlPanelModel, width: number): ReactNode {
  const page = buildDoctorPageModel(model.doctorData, model.locale);

  return h(
    InkPanel,
    {
      title: page.title,
      tone: page.titleTone,
      badge: page.badge,
      width,
    },
    ...page.introLines.map((line) => h(Text, null, line)),
    h(Text, null, ""),
    ...InkKeyValueList({ entries: page.snapshotEntries }),
    h(Text, null, ""),
    ...(page.nextStepCommands
      ? InkCommandList({ entries: page.nextStepCommands })
      : InkBulletList({ items: page.cleanupBullets ?? [] })),
  );
}

function renderStatusDetail(
  model: ControlPanelModel,
  overlay: OverlayProfile | undefined,
  width: number,
): ReactNode {
  const text = getUiText(model.locale);
  if (!overlay) {
    return h(
      InkPanel,
      {
        title: text.misc.isolateStatusTitle,
        tone: "warn",
        width,
      },
      h(Text, null, text.controlPanel.overlayActionDisabled),
    );
  }

  const status = model.isolateStatuses.get(overlay.id);
  const tone = status ? healthTone(status.health) : "warn";
  const healthLabel = status ? resolveHealthLabel(status.health, model.locale) : text.profiles.missingBadge;

  return h(
    InkPanel,
    {
      title: text.misc.isolateStatusTitle,
      tone,
      badge: overlay.id,
      width,
    },
    ...InkKeyValueList({
      entries: [
        { label: "status", value: healthLabel, tone },
        { label: "home-dir", value: status?.homeDir ?? overlay.isolate?.homeDir ?? text.profiles.missingBadge },
        { label: "manifest", value: status?.manifestFile ?? text.profiles.missingBadge },
        {
          label: "home-present",
          value: status?.homeExists ? text.profiles.storedBadge : text.profiles.missingBadge,
          tone: status?.homeExists ? "ok" : "warn",
        },
        {
          label: "metadata",
          value: status?.metadataExists
            ? status.metadataState ?? text.profiles.storedBadge
            : text.profiles.missingBadge,
          tone: status?.metadataExists ? "ok" : "warn",
        },
        {
          label: "seed-mode",
          value: status?.manifest?.seedMode ?? text.profiles.missingBadge,
        },
        {
          label: "source-config",
          value:
            status?.manifest?.sourceConfigDir ??
            overlay.isolate?.source.configDir ??
            text.profiles.missingBadge,
        },
        {
          label: "continuity-session",
          value: overlay.isolate?.continuity?.importedSessionId ?? text.profiles.missingBadge,
          tone: overlay.isolate?.continuity?.importedSessionId ? "ok" : "dim",
        },
      ],
    }),
  );
}

function renderConfirmDetail(
  model: ControlPanelModel,
  action: PendingFreshAction | undefined,
  confirmIndex: number,
  theme: ControlPanelTheme,
  width: number,
): ReactNode {
  const text = getUiText(model.locale);
  if (!action) {
    return h(
      InkPanel,
      {
        title: text.controlPanel.confirmColumnTitle,
        tone: "warn",
        width,
      },
      h(Text, null, text.controlPanel.overlayActionDisabled),
    );
  }

  const summary = action.clean
    ? text.controlPanel.confirmCleanSummary(action.profileId)
    : text.controlPanel.confirmFreshSummary(action.profileId);
  const command = action.clean
    ? `cco isolate fresh --clean ${action.profileId}`
    : `cco isolate fresh ${action.profileId}`;

  return h(
    InkPanel,
    {
      title: text.controlPanel.confirmColumnTitle,
      tone: "warn",
      badge: action.profileId,
      width,
    },
    ...InkBulletList({
      items: [
        summary,
        text.controlPanel.confirmWarning,
        text.controlPanel.confirmDefault,
      ],
    }),
    h(Text, null, ""),
    ...InkKeyValueList({
      entries: [
        {
          label: "command",
          value: command,
          tone: "warn",
        },
        {
          label: "mode",
          value: action.clean
            ? text.controlPanel.actionClean
            : text.controlPanel.actionFresh,
          tone: "warn",
        },
      ],
    }),
    h(Text, null, ""),
    ...[
      text.controlPanel.confirmCancel,
      text.controlPanel.confirmProceed,
    ].map((label, index) =>
      h(
        Text,
        {
          key: label,
          color: resolveConfirmChoiceColor(index, confirmIndex),
          inverse: confirmIndex === index && index === 0 && theme.selectedRowInverse,
          wrap: "truncate-end",
        },
        `${confirmIndex === index ? theme.selectedMarker : theme.idleMarker} ${label}`,
      ),
    ),
  );
}

function renderHelpDetail(
  locale: AppLocale,
  appearance: ControlPanelAppearance,
  width: number,
): ReactNode {
  const text = getUiText(locale);
  const modeBadge = appearance === "rich"
    ? text.controlPanel.richModeBadge
    : text.controlPanel.stableModeBadge;

  return h(
    InkPanel,
    {
      title: text.controlPanel.helpColumnTitle,
      tone: "dim",
      badge: modeBadge,
      width,
    },
    ...InkBulletList({
      items: [
        text.controlPanel.keyHelp,
        text.controlPanel.liveSummary,
        text.controlPanel.stableModeSummary,
        text.controlPanel.richModeSummary,
      ],
    }),
  );
}

function renderFooter(props: {
  readonly locale: AppLocale;
  readonly filter: string;
  readonly filterActive: boolean;
  readonly columns: number;
  readonly repaintEpoch: number;
  readonly confirmActive: boolean;
}): ReactNode {
  const text = getUiText(props.locale);
  const filter = props.filter || props.filterActive
    ? `  filter=${props.filterActive ? "/" : ""}${props.filter}`
    : "";
  const repaintMarker = props.repaintEpoch % 2 === 0 ? "" : " ";
  const keyHelp = props.confirmActive
    ? text.controlPanel.confirmCompactKeyHelp
    : text.controlPanel.compactKeyHelp;

  return h(
    Box,
    {
      borderStyle: "single",
      borderColor: "gray",
      paddingX: 1,
      marginTop: 1,
      width: props.columns,
    },
    h(Text, dimColorProps, `${keyHelp}${filter}${repaintMarker}`),
  );
}

function renderBrand(appearance: ControlPanelAppearance): ReactNode {
  if (appearance !== "rich") {
    return h(Text, { color: "cyan", bold: true }, "cco");
  }

  return h(
    Box,
    { flexDirection: "row" },
    h(Text, { color: "cyan", bold: true }, "c"),
    h(Text, { color: "blue", bold: true }, "c"),
    h(Text, { color: "magenta", bold: true }, "o"),
  );
}

function handleAction(
  action: ControlPanelActionItem,
  profile: Profile,
  overlay: OverlayProfile | undefined,
  setView: (view: ControlPanelView) => void,
  setPendingFreshAction: (action: PendingFreshAction | undefined) => void,
  setConfirmIndex: (index: number) => void,
  onSubmit: (outcome: ControlPanelOutcome) => void,
  exit: () => void,
): void {
  if (action.disabled) {
    return;
  }

  switch (action.id) {
    case "continue":
      submitAndExit(
        { kind: "launch", profileId: profile.id, claudeArgs: ["-c"] },
        onSubmit,
        exit,
      );
      return;
    case "run":
      submitAndExit({ kind: "launch", profileId: profile.id }, onSubmit, exit);
      return;
    case "host":
      submitAndExit({ kind: "launch", profileId: "host" }, onSubmit, exit);
      return;
    case "explain":
      setView("explain");
      return;
    case "doctor":
      setView("doctor");
      return;
    case "status":
      setView("status");
      return;
    case "fresh":
      if (overlay) {
        setPendingFreshAction({ profileId: overlay.id, clean: false });
        setConfirmIndex(0);
        setView("confirm");
      }
      return;
    case "clean":
      if (overlay) {
        setPendingFreshAction({ profileId: overlay.id, clean: true });
        setConfirmIndex(0);
        setView("confirm");
      }
      return;
    case "quit":
      submitAndExit({ kind: "quit" }, onSubmit, exit);
      return;
  }
}

function submitFreshAction(
  action: PendingFreshAction,
  onSubmit: (outcome: ControlPanelOutcome) => void,
  exit: () => void,
): void {
  submitAndExit(
    {
      kind: "fresh",
      profileId: action.profileId,
      clean: action.clean,
      confirmed: true,
    },
    onSubmit,
    exit,
  );
}

function submitAndExit(
  outcome: ControlPanelOutcome,
  onSubmit: (outcome: ControlPanelOutcome) => void,
  exit: () => void,
): void {
  onSubmit(outcome);
  exit();
}

function normalizeProfiles(profiles: readonly Profile[]): readonly Profile[] {
  return profiles.length > 0
    ? profiles
    : [{ id: "host", label: "Host", kind: "host" } as const];
}

function filterProfiles(profiles: readonly Profile[], filter: string): readonly Profile[] {
  const normalized = filter.trim().toLowerCase();
  if (!normalized) {
    return profiles;
  }

  return profiles.filter((profile) => profile.id.toLowerCase().includes(normalized));
}

function resolveTokenBadge(
  profile: Profile,
  tokenPresence: ReadonlyMap<string, boolean>,
  locale: AppLocale,
): string {
  const text = getUiText(locale);
  if (profile.kind === "host") {
    return text.profiles.hostLoginBadge;
  }

  return tokenPresence.get(profile.id) ? text.profiles.storedBadge : text.profiles.missingBadge;
}

function resolveIsolateBadge(
  profile: Profile,
  isolateStatuses: ReadonlyMap<string, IsolateHomeStatus>,
  locale: AppLocale,
  theme: ControlPanelTheme,
): string {
  const text = getUiText(locale);
  if (profile.kind === "host") {
    return text.profiles.hostBadge;
  }

  const status = isolateStatuses.get(profile.id);
  if (!status) {
    return `${theme.statusMissingPrefix}${text.profiles.missingBadge}`;
  }

  return `${resolveHealthPrefix(status.health, theme)}${resolveHealthLabel(status.health, locale)}`;
}

function summarizeHostLinks(
  profile: Profile,
  hostLinkStatuses: ReadonlyMap<string, readonly HostLinkEntryStatus[]>,
  locale: AppLocale,
): { readonly label: string; readonly tone: InkTone } {
  const text = getUiText(locale);
  if (profile.kind === "host") {
    return { label: text.controlPanel.hostProfileBadge, tone: "accent" };
  }

  const links = hostLinkStatuses.get(profile.id) ?? [];
  const expected = links.filter((entry) => entry.state !== "missing-source");
  const ready = expected.filter((entry) => entry.state === "linked" || entry.state === "present");
  if (expected.length === 0) {
    return { label: text.profiles.missingBadge, tone: "dim" };
  }

  return {
    label: ready.length === expected.length
      ? text.controlPanel.hostLinksOk(ready.length, expected.length)
      : text.controlPanel.hostLinksPartial(ready.length, expected.length),
    tone: ready.length === expected.length ? "ok" : "warn",
  };
}

function summarizeSession(
  profile: Profile,
  isolateStatuses: ReadonlyMap<string, IsolateHomeStatus>,
  locale: AppLocale,
): string {
  const text = getUiText(locale);
  if (profile.kind === "host") {
    return text.controlPanel.hostSessionSummary;
  }

  const status = isolateStatuses.get(profile.id);
  if (status?.health === "ready") {
    return text.controlPanel.sessionLinkedSummary;
  }

  return text.controlPanel.sessionPendingSummary;
}

function resolveHealthPrefix(
  health: IsolateHomeStatus["health"],
  theme: ControlPanelTheme,
): string {
  switch (health) {
    case "ready":
      return theme.statusReadyPrefix;
    case "missing":
      return theme.statusMissingPrefix;
    case "broken":
      return theme.statusBrokenPrefix;
  }
}

function resolveHealthLabel(
  health: IsolateHomeStatus["health"],
  locale: AppLocale,
): string {
  const text = getUiText(locale);

  switch (health) {
    case "ready":
      return text.misc.isolateStatusReadyBadge;
    case "missing":
      return text.misc.isolateStatusMissingBadge;
    case "broken":
      return text.misc.isolateStatusBrokenBadge;
  }
}

function healthTone(health: IsolateHomeStatus["health"]): InkTone {
  switch (health) {
    case "ready":
      return "ok";
    case "missing":
      return "dim";
    case "broken":
      return "warn";
  }
}

function hostLinkLabel(
  state: HostLinkEntryStatus["state"],
  locale: AppLocale,
): string {
  const text = getUiText(locale);

  switch (state) {
    case "linked":
      return text.controlPanel.hostLinkLinked;
    case "present":
      return text.controlPanel.hostLinkPresent;
    case "missing-source":
      return text.controlPanel.hostLinkMissingSource;
    case "missing-target":
      return text.controlPanel.hostLinkMissingTarget;
  }
}

function hostLinkTone(state: HostLinkEntryStatus["state"]): InkTone {
  switch (state) {
    case "linked":
    case "present":
      return "ok";
    case "missing-source":
      return "dim";
    case "missing-target":
      return "warn";
  }
}

function hostLinkColor(
  state: HostLinkEntryStatus["state"],
): "green" | "yellow" | "gray" {
  switch (hostLinkTone(state)) {
    case "ok":
      return "green";
    case "warn":
      return "yellow";
    case "accent":
    case "dim":
      return "gray";
  }
}

function resolveControlPanelTheme(
  appearance: ControlPanelAppearance,
): ControlPanelTheme {
  if (appearance === "rich") {
    return {
      selectedMarker: "›",
      idleMarker: " ",
      dangerMarker: "[!]",
      statusReadyPrefix: "● ",
      statusMissingPrefix: "○ ",
      statusBrokenPrefix: "◆ ",
      selectedRowInverse: true,
    };
  }

  return {
    selectedMarker: ">",
    idleMarker: " ",
    dangerMarker: "[!]",
    statusReadyPrefix: "",
    statusMissingPrefix: "",
    statusBrokenPrefix: "",
    selectedRowInverse: false,
  };
}

function resolveViewportColumns(columns: number): number {
  return Math.max(1, columns - 1);
}

function resolveLayout(columns: number): ControlPanelLayout {
  if (columns >= 120) {
    const profileWidth = 32;
    const actionWidth = 30;
    const gutterWidth = 2;

    return {
      kind: "wide",
      columns,
      profileWidth,
      actionWidth,
      detailWidth: columns - profileWidth - actionWidth - gutterWidth,
    };
  }

  if (columns >= 90) {
    const leftWidth = 34;
    const gutterWidth = 1;

    return {
      kind: "medium",
      columns,
      leftWidth,
      detailWidth: columns - leftWidth - gutterWidth,
    };
  }

  return {
    kind: "narrow",
    columns,
  };
}

function windowAround<T>(
  items: readonly T[],
  selectedIndex: number,
  maxItems: number,
): { readonly items: readonly T[]; readonly offset: number } {
  if (items.length <= maxItems) {
    return { items, offset: 0 };
  }

  const selected = wrapIndex(selectedIndex, items.length);
  const half = Math.floor(maxItems / 2);
  const offset = Math.max(0, Math.min(selected - half, items.length - maxItems));

  return {
    items: items.slice(offset, offset + maxItems),
    offset,
  };
}

function wrapIndex(index: number, length: number): number {
  if (length <= 0) {
    return 0;
  }

  return ((index % length) + length) % length;
}

function isOverlayProfile(profile: Profile): profile is OverlayProfile {
  return profile.kind === "overlay";
}
