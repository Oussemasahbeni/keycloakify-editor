/**
 * TanStack Query bindings for the account REST API.
 *
 * One hook per endpoint the console reads, sharing a key factory so mutations can invalidate
 * precisely what they changed. Every hook injects the Keycloak context (token refresh happens in
 * `request()`) and the query's abort signal, so callers only deal with `data` / `isPending`.
 */

import { type QueryKey, type UseQueryResult, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { AccountEnvironment } from "..";
import { type KeycloakContext, useEnvironment } from "../../shared/keycloak-ui-shared";
import { fetchPermission, fetchResources } from "../api";
import fetchContentJson from "../content/fetchContent";
import {
    type LinkedAccountQueryParams,
    getApplications,
    getCredentials,
    getDevices,
    getGroups,
    getIssuedVerifiableCredentials,
    getLinkedAccounts,
    getPermissionRequests,
    getPersonalInfo,
    getSupportedLocales,
    getUserOrganizations,
    getVerifiableCredentials,
} from "./methods";
import type { Permission } from "./representations";

export const accountKeys = {
    all: ["account"] as const,
    content: () => [...accountKeys.all, "content"] as const,
    personalInfo: () => [...accountKeys.all, "personal-info"] as const,
    supportedLocales: () => [...accountKeys.all, "supported-locales"] as const,
    credentials: () => [...accountKeys.all, "credentials"] as const,
    devices: () => [...accountKeys.all, "devices"] as const,
    linkedAccounts: (params?: LinkedAccountQueryParams) =>
        params
            ? ([...accountKeys.all, "linked-accounts", params] as const)
            : ([...accountKeys.all, "linked-accounts"] as const),
    applications: () => [...accountKeys.all, "applications"] as const,
    groups: () => [...accountKeys.all, "groups"] as const,
    organizations: () => [...accountKeys.all, "organizations"] as const,
    resources: (isShared?: boolean, params?: Record<string, string>) =>
        isShared === undefined
            ? ([...accountKeys.all, "resources"] as const)
            : ([...accountKeys.all, "resources", isShared ? "shared" : "own", params ?? {}] as const),
    verifiableCredentials: () => [...accountKeys.all, "verifiable-credentials"] as const,
    issuedVerifiableCredentials: () => [...accountKeys.all, "issued-verifiable-credentials"] as const,
};

export type AccountContext = KeycloakContext<AccountEnvironment>;

type Fetcher<T> = (options: { signal: AbortSignal; context: AccountContext }) => Promise<T>;

type QueryOptions<T, S> = {
    /** Derive the data the component needs; keep the function stable (module level). */
    select?: (data: T) => S;
    staleTime?: number;
    refetchOnWindowFocus?: boolean;
    enabled?: boolean;
};

/** `useQuery` bound to the account API: injects the Keycloak context and the abort signal. */
export function useAccountQuery<T, S = T>(queryKey: QueryKey, fetcher: Fetcher<T>, options: QueryOptions<T, S> = {}) {
    const context = useEnvironment<AccountEnvironment>();
    return useQuery({
        queryKey,
        queryFn: ({ signal }) => fetcher({ signal, context }),
        ...options,
    });
}

type MutationOptions<TVariables, TData> = {
    /** Query keys to invalidate once the call succeeded (prefix match). */
    invalidates?: QueryKey[];
    onSuccess?: (data: TData, variables: TVariables) => unknown;
    onError?: (error: unknown, variables: TVariables) => unknown;
};

/**
 * `useMutation` bound to the account API; invalidates the given keys before `onSuccess`.
 * No generic defaults on purpose: with them TypeScript stops inferring `TVariables` from the
 * (context-sensitive) callback. Use `useAccountAction` when the call takes no variables.
 */
export function useAccountMutation<TVariables, TData>(
    mutate: (context: AccountContext, variables: TVariables) => Promise<TData>,
    { invalidates = [], onSuccess, onError }: MutationOptions<TVariables, TData> = {},
) {
    const context = useEnvironment<AccountEnvironment>();
    const queryClient = useQueryClient();

    return useMutation<TData, unknown, TVariables>({
        mutationFn: variables => mutate(context, variables),
        onSuccess: async (data, variables) => {
            await Promise.all(invalidates.map(queryKey => queryClient.invalidateQueries({ queryKey })));
            await onSuccess?.(data, variables);
        },
        onError: (error, variables) => {
            onError?.(error, variables);
        },
    });
}

/** `useAccountMutation` for calls without variables: `action.mutate()`. */
export function useAccountAction<TData>(
    mutate: (context: AccountContext) => Promise<TData>,
    options: MutationOptions<void, TData> = {},
) {
    return useAccountMutation<void, TData>(context => mutate(context), options);
}

// --- reads -------------------------------------------------------------------------------

/** `content.json`: the navigation + routes. Loaded once; shared by the router and the sidebar. */
export const useContent = () =>
    useAccountQuery(accountKeys.content(), fetchContentJson, {
        staleTime: Infinity,
    });

/** Backs an editable form, so it must not refetch under the user's feet; invalidated after save. */
export const usePersonalInfo = () =>
    useAccountQuery(accountKeys.personalInfo(), getPersonalInfo, {
        staleTime: Infinity,
        refetchOnWindowFocus: false,
    });

export const useSupportedLocales = () =>
    useAccountQuery(accountKeys.supportedLocales(), getSupportedLocales, {
        staleTime: Infinity,
    });

export const useCredentials = () => useAccountQuery(accountKeys.credentials(), getCredentials);

export const useDevices = <S>(select: (devices: Awaited<ReturnType<typeof getDevices>>) => S): UseQueryResult<S> =>
    useAccountQuery(accountKeys.devices(), getDevices, { select });

export const useLinkedAccounts = (params: LinkedAccountQueryParams) =>
    useAccountQuery(accountKeys.linkedAccounts(params), options => getLinkedAccounts(options, params));

export const useApplications = () => useAccountQuery(accountKeys.applications(), getApplications);

export const useGroups = <S>(select: (groups: Awaited<ReturnType<typeof getGroups>>) => S): UseQueryResult<S> =>
    useAccountQuery(accountKeys.groups(), getGroups, { select });

export const useOrganizations = () => useAccountQuery(accountKeys.organizations(), getUserOrganizations);

export const useVerifiableCredentials = () =>
    useAccountQuery(accountKeys.verifiableCredentials(), getVerifiableCredentials);

export const useIssuedVerifiableCredentials = <S>(
    select: (issued: Awaited<ReturnType<typeof getIssuedVerifiableCredentials>>) => S,
): UseQueryResult<S> =>
    useAccountQuery(accountKeys.issuedVerifiableCredentials(), getIssuedVerifiableCredentials, { select });

/** A page of resources; for owned resources also who they are shared with and pending requests. */
export const useResources = (isShared: boolean, params: Record<string, string>) =>
    useAccountQuery(accountKeys.resources(isShared, params), async ({ signal, context }) => {
        const result = await fetchResources({ signal, context }, params, isShared);
        const permissions: Record<string, Permission[]> = {};
        if (!isShared) {
            await Promise.all(
                result.data.map(async resource => {
                    [resource.shareRequests, permissions[resource._id]] = await Promise.all([
                        getPermissionRequests(resource._id, {
                            signal,
                            context,
                        }),
                        fetchPermission({ signal, context }, resource._id),
                    ]);
                }),
            );
        }
        return {
            resources: result.data,
            hasNext: !!result.links?.next,
            permissions,
        };
    });
