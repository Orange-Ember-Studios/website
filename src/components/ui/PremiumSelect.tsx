import {
  IconCheck,
  IconChevronDown,
  IconLogIn,
  IconLogOut,
  IconMenu,
  IconUser,
  IconX,
} from "@emberkit/icons";
import type { FC } from "@emberkit/core";

export type SelectOption = {
  id: string;
  label: string;
  color?: string;
  i18nKey?: string;
};

export type PremiumSelectProps = {
  id: string;
  label?: string;
  options: SelectOption[];
  isMultiple?: boolean;
  initialValues?: string | string[];
  defaultLabel?: string;
  defaultLabelI18n?: string;
  labelI18n?: string;
  className?: string;
  containerId?: string;
  variant?: "default" | "navbar";
};

export const PremiumSelect: FC<PremiumSelectProps> = ({
  id,
  label,
  options,
  isMultiple = false,
  initialValues = [],
  defaultLabel = "Select option",
  defaultLabelI18n,
  labelI18n,
  className = "",
  containerId = `select-container-${id}`,
  variant = "default",
}) => {
  const initialValuesArray = (Array.isArray(initialValues)
    ? initialValues
    : [initialValues].filter(Boolean)) as string[];

  const isNavbar = variant === "navbar";

  return (
    <div
      className={`premium-select-container ${className} ${isNavbar ? "premium-select-navbar" : ""}`}
      id={containerId}
      data-is-multiple={isMultiple ? "true" : "false"}
      data-id={id}
      data-initial-values={JSON.stringify(initialValuesArray)}
      data-variant={variant}
    >
      <div className="relative w-full group">
        {label && !isNavbar ? (
          <label
            className="text-[10px] uppercase tracking-[0.25em] font-black text-white/30 mb-3 block ml-1"
            data-i18n={labelI18n}
          >
            {label}
          </label>
        ) : null}

        <button
          type="button"
          className={`select-trigger w-full flex items-center justify-between bg-white/5 border border-white/10 rounded-2xl text-white font-bold hover:bg-white/10 hover:border-orange-500/50 transition-all duration-300 shadow-xl ${isNavbar ? "px-4 py-2 min-h-[40px] text-xs" : "px-6 py-4 min-h-[60px] text-base"}`}
        >
          <span className="selected-label truncate" data-i18n={defaultLabelI18n}>
            {defaultLabel}
          </span>
          <IconChevronDown
            className={`text-orange-500 transition-transform duration-300 ml-3 arrow-icon ${isNavbar ? "h-4 w-4" : "h-5 w-5"}`}
          />
        </button>

        <div
          className={`select-dropdown flex-col hidden absolute top-full mt-4 bg-[#0d0d0d]/98 border border-white/10 rounded-3xl shadow-[0_45px_100px_rgba(0,0,0,0.95)] z-[110] transition-all duration-500 origin-top scale-95 opacity-0 w-max overflow-x-hidden backdrop-blur-3xl ${isNavbar ? "right-0 max-w-[180px]" : "left-0 max-w-[250px]"}`}
        >
          <div
            className={`max-h-[440px] overflow-y-auto overflow-x-hidden custom-scrollbar flex flex-col gap-1 w-full ${isNavbar ? "p-1.5" : "p-3"}`}
          >
            {options.map((option) => (
              <button
                key={option.id}
                type="button"
                className={`option-btn flex items-center w-full rounded-xl hover:bg-white/5 transition-all text-left group/opt ${isNavbar ? "px-3 py-2" : "px-6 py-4.5 rounded-[1.25rem]"}`}
                data-value={option.id}
              >
                <div
                  className={`shrink-0 border border-white/20 flex items-center justify-center group-[.active]/opt:bg-orange-500 group-[.active]/opt:border-orange-500 group-[.active]/opt:shadow-[0_0_15px_rgba(249,115,22,0.4)] transition-all duration-300 ${isMultiple ? "rounded-lg" : "rounded-full"} ${isNavbar ? "w-4 h-4 mr-3" : "w-6 h-6 mr-5"}`}
                >
                  <IconCheck
                    className={`text-white opacity-0 group-[.active]/opt:opacity-100 transition-opacity ${isNavbar ? "h-2.5 w-2.5" : "h-4 w-4"}`}
                  />
                </div>
                <span
                  className={`font-bold text-gray-400 group-[.active]/opt:text-white leading-tight transition-colors truncate block grow pr-2 ${isNavbar ? "text-xs" : "text-base tracking-wide"}`}
                  data-i18n={option.i18nKey}
                  data-tag-id={id === "tag-filter" ? option.id : undefined}
                >
                  {option.label}
                </span>
                {option.color ? (
                  <div
                    className={`ml-auto shrink-0 rounded-full shadow-lg ${option.color} group-hover/opt:scale-125 transition-transform ${isNavbar ? "w-1.5 h-1.5" : "w-2.5 h-2.5"}`}
                  />
                ) : null}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PremiumSelect;
