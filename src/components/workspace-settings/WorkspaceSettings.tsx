"use client";

import { useEffect, useState, type FormEvent } from "react";
import ApiState from "@/components/common/ApiState";
import {
  useIntegrationsSettings,
  useUpdateIntegrationsSettings,
  useUpdateWorkspaceSettings,
  useWorkspaceSettings,
} from "@/features/settings/hooks/useSettings";

type WorkspaceFormState = {
  name: string;
  logo: string;
  timezone: string;
  locale: string;
  description: string;
};

type FacebookFormState = {
  token: string;
  pageId: string;
};

const DEFAULT_WORKSPACE_FORM: WorkspaceFormState = {
  name: "",
  logo: "",
  timezone: "Asia/Ho_Chi_Minh",
  locale: "vi",
  description: "",
};

const DEFAULT_FACEBOOK_FORM: FacebookFormState = {
  token: "",
  pageId: "",
};

const fieldClassName =
  "w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-lime-400 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-200";

export default function WorkspaceSettings() {
  const workspaceQuery = useWorkspaceSettings();
  const integrationsQuery = useIntegrationsSettings();
  const updateWorkspace = useUpdateWorkspaceSettings();
  const updateIntegrations = useUpdateIntegrationsSettings();

  const [workspaceForm, setWorkspaceForm] = useState<WorkspaceFormState>(
    DEFAULT_WORKSPACE_FORM
  );
  const [facebookForm, setFacebookForm] = useState<FacebookFormState>(
    DEFAULT_FACEBOOK_FORM
  );
  const [workspaceMessage, setWorkspaceMessage] = useState("");
  const [facebookMessage, setFacebookMessage] = useState("");

  useEffect(() => {
    const workspace = workspaceQuery.data;
    if (!workspace) return;

    setWorkspaceForm({
      name: workspace.name ?? "",
      logo: workspace.logo ?? "",
      timezone: workspace.timezone ?? "Asia/Ho_Chi_Minh",
      locale: workspace.locale ?? "vi",
      description: workspace.description ?? "",
    });
  }, [workspaceQuery.data]);

  useEffect(() => {
    const facebook = integrationsQuery.data?.facebook;
    if (!facebook) return;

    setFacebookForm({
      token: facebook.token ?? "",
      pageId: facebook.pageId ?? "",
    });
  }, [integrationsQuery.data]);

  async function handleWorkspaceSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setWorkspaceMessage("");

    try {
      await updateWorkspace.mutateAsync({
        name: workspaceForm.name,
        logo: workspaceForm.logo,
        timezone: workspaceForm.timezone,
        locale: workspaceForm.locale,
        description: workspaceForm.description,
      });
      setWorkspaceMessage("Đã lưu thông tin workspace.");
    } catch (error) {
      setWorkspaceMessage(
        error instanceof Error ? error.message : "Không lưu được workspace."
      );
    }
  }

  async function handleFacebookSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFacebookMessage("");

    try {
      await updateIntegrations.mutateAsync({
        facebook: {
          token: facebookForm.token,
          pageId: facebookForm.pageId,
        },
      });
      setFacebookMessage("Đã lưu kết nối Facebook.");
    } catch (error) {
      setFacebookMessage(
        error instanceof Error ? error.message : "Không lưu được Facebook."
      );
    }
  }

  const isLoading = workspaceQuery.isLoading || integrationsQuery.isLoading;
  const error = workspaceQuery.error ?? integrationsQuery.error ?? null;

  return (
    <div className="flex w-full flex-col gap-5 text-gray-800 dark:text-gray-200">
      <div className="flex w-full flex-col overflow-hidden rounded-2xl bg-white p-6 shadow-theme-xs dark:border-gray-800 dark:bg-[#11121e] md:p-8">
        <div className="flex flex-col gap-6 text-left">
          <div className="border-b border-gray-100 pb-3 dark:border-gray-800">
            <h3 className="text-xs font-extrabold text-gray-900 dark:text-white sm:text-sm">
              Workspace
            </h3>
            <p className="mt-1 text-[10px] font-medium text-gray-400">
              Thông tin gửi trực tiếp tới backend LadiPage.
            </p>
          </div>

          <ApiState isLoading={isLoading} error={error}>
            <form
              className="grid gap-4 md:grid-cols-2"
              onSubmit={handleWorkspaceSubmit}
            >
              <label className="flex flex-col gap-1.5 text-xs font-bold text-gray-700 dark:text-gray-300">
                Tên workspace
                <input
                  value={workspaceForm.name}
                  maxLength={255}
                  onChange={(event) =>
                    setWorkspaceForm((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                  className={fieldClassName}
                  placeholder="LadiPage Workspace"
                />
              </label>

              <label className="flex flex-col gap-1.5 text-xs font-bold text-gray-700 dark:text-gray-300">
                Logo URL
                <input
                  value={workspaceForm.logo}
                  onChange={(event) =>
                    setWorkspaceForm((current) => ({
                      ...current,
                      logo: event.target.value,
                    }))
                  }
                  className={fieldClassName}
                  placeholder="https://..."
                />
              </label>

              <label className="flex flex-col gap-1.5 text-xs font-bold text-gray-700 dark:text-gray-300">
                Múi giờ
                <select
                  value={workspaceForm.timezone}
                  onChange={(event) =>
                    setWorkspaceForm((current) => ({
                      ...current,
                      timezone: event.target.value,
                    }))
                  }
                  className={fieldClassName}
                >
                  <option value="Asia/Ho_Chi_Minh">Asia/Ho_Chi_Minh</option>
                  <option value="Asia/Bangkok">Asia/Bangkok</option>
                  <option value="Asia/Singapore">Asia/Singapore</option>
                  <option value="UTC">UTC</option>
                </select>
              </label>

              <label className="flex flex-col gap-1.5 text-xs font-bold text-gray-700 dark:text-gray-300">
                Ngôn ngữ
                <select
                  value={workspaceForm.locale}
                  onChange={(event) =>
                    setWorkspaceForm((current) => ({
                      ...current,
                      locale: event.target.value,
                    }))
                  }
                  className={fieldClassName}
                >
                  <option value="vi">Tiếng Việt</option>
                  <option value="en">English</option>
                </select>
              </label>

              <label className="flex flex-col gap-1.5 text-xs font-bold text-gray-700 dark:text-gray-300 md:col-span-2">
                Mô tả
                <textarea
                  value={workspaceForm.description}
                  onChange={(event) =>
                    setWorkspaceForm((current) => ({
                      ...current,
                      description: event.target.value,
                    }))
                  }
                  className={`${fieldClassName} min-h-24 resize-y`}
                  placeholder="Ghi chú nội bộ cho workspace"
                />
              </label>

              <div className="flex flex-wrap items-center gap-3 md:col-span-2">
                <button
                  type="submit"
                  disabled={updateWorkspace.isPending}
                  className="cursor-pointer rounded-xl bg-lime-500 px-4 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-lime-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {updateWorkspace.isPending ? "Đang lưu..." : "Lưu workspace"}
                </button>
                {workspaceMessage && (
                  <span className="text-xs font-semibold text-lime-600 dark:text-lime-300">
                    {workspaceMessage}
                  </span>
                )}
              </div>
            </form>

            <form
              className="grid gap-4 border-t border-gray-100 pt-5 dark:border-gray-800 md:grid-cols-2"
              onSubmit={handleFacebookSubmit}
            >
              <label className="flex flex-col gap-1.5 text-xs font-bold text-gray-700 dark:text-gray-300">
                Facebook token
                <input
                  value={facebookForm.token}
                  onChange={(event) =>
                    setFacebookForm((current) => ({
                      ...current,
                      token: event.target.value,
                    }))
                  }
                  className={fieldClassName}
                  placeholder="EAAG..."
                />
              </label>

              <label className="flex flex-col gap-1.5 text-xs font-bold text-gray-700 dark:text-gray-300">
                Facebook page ID
                <input
                  value={facebookForm.pageId}
                  onChange={(event) =>
                    setFacebookForm((current) => ({
                      ...current,
                      pageId: event.target.value,
                    }))
                  }
                  className={fieldClassName}
                  placeholder="Page ID"
                />
              </label>

              <div className="flex flex-wrap items-center gap-3 md:col-span-2">
                <button
                  type="submit"
                  disabled={updateIntegrations.isPending}
                  className="cursor-pointer rounded-xl bg-lime-500 px-4 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-lime-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {updateIntegrations.isPending ? "Đang lưu..." : "Lưu Facebook"}
                </button>
                {facebookMessage && (
                  <span className="text-xs font-semibold text-lime-600 dark:text-lime-300">
                    {facebookMessage}
                  </span>
                )}
              </div>
            </form>
          </ApiState>
        </div>
      </div>
    </div>
  );
}
