<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { Check, ChevronDown, LogIn, LogOut, Menu, User, X } from 'lucide-vue-next';

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
  variant?: 'default' | 'navbar';
};

const props = withDefaults(defineProps<PremiumSelectProps>(), {
  isMultiple: false,
  initialValues: () => [],
  defaultLabel: 'Select option',
  className: '',
  containerId: (id: string) => `select-container-${id}`,
  variant: 'default',
});

const isOpen = ref(false);
const selectedValues = ref<string[]>([]);

const initialValuesArray = computed(() => {
  const vals = props.initialValues;
  return Array.isArray(vals) ? vals : [vals].filter(Boolean);
});

const isNavbar = computed(() => props.variant === 'navbar');

const containerId = computed(() => props.containerId || `select-container-${props.id}`);

onMounted(() => {
  selectedValues.value = [...initialValuesArray.value];
  document.addEventListener('click', handleOutsideClick);
});

onUnmounted(() => {
  document.removeEventListener('click', handleOutsideClick);
});

function handleOutsideClick(e: MouseEvent) {
  const container = document.getElementById(containerId.value);
  if (container && !container.contains(e.target as Node)) {
    isOpen.value = false;
  }
}

function toggleDropdown() {
  isOpen.value = !isOpen.value;
}

function selectOption(optionId: string) {
  if (props.isMultiple) {
    const idx = selectedValues.value.indexOf(optionId);
    if (idx >= 0) {
      selectedValues.value.splice(idx, 1);
    } else {
      selectedValues.value.push(optionId);
    }
    dispatchChange();
  } else {
    selectedValues.value = [optionId];
    isOpen.value = false;
    dispatchChange();
  }
}

function dispatchChange() {
  const customEvent = new CustomEvent('change', {
    bubbles: true,
    detail: {
      id: 'lang-selector',
      values: selectedValues.value,
    },
  });
  document.dispatchEvent(customEvent);
}

const currentLabel = computed(() => {
  if (selectedValues.value.length === 0) {
    return props.defaultLabel;
  }
  const selected = props.options.find((o) => o.id === selectedValues.value[0]);
  return selected?.label || props.defaultLabel;
});
</script>

<template>
  <div
    :id="containerId"
    class="premium-select-container"
    :class="[props.className, { 'premium-select-navbar': isNavbar }]"
    :data-is-multiple="isMultiple ? 'true' : 'false'"
    :data-id="id"
    :data-initial-values="JSON.stringify(initialValuesArray)"
    :data-variant="variant"
  >
    <div class="relative w-full group">
      <button
        type="button"
        class="select-trigger w-full flex items-center justify-between bg-white/5 border border-white/10 rounded-2xl text-white font-bold hover:bg-white/10 hover:border-orange-500/50 transition-all duration-300 shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-ember-500"
        :class="isNavbar ? 'px-4 py-2 min-h-[40px] text-xs' : 'px-6 py-4 min-h-[60px] text-base'"
        @click="toggleDropdown"
      >
        <span class="selected-label truncate" :data-i18n="defaultLabelI18n">
          {{ currentLabel }}
        </span>
        <ChevronDown
          class="text-orange-500 transition-transform duration-300 ml-3 arrow-icon"
          :class="[isNavbar ? 'h-4 w-4' : 'h-5 w-5', { 'rotate-180': isOpen }]"
        />
      </button>

      <div
        class="select-dropdown flex-col absolute top-full mt-4 bg-[#0d0d0d]/98 border border-white/10 rounded-3xl shadow-[0_45px_100px_rgba(0,0,0,0.95)] z-[110] transition-all duration-500 origin-top scale-95 opacity-0 w-max overflow-x-hidden backdrop-blur-3xl pointer-events-none"
        :class="[
          isNavbar ? 'right-0 max-w-[180px]' : 'left-0 max-w-[250px]',
          { 'opacity-100 scale-100 pointer-events-auto': isOpen }
        ]"
      >
        <div
          class="max-h-[440px] overflow-y-auto overflow-x-hidden custom-scrollbar flex flex-col gap-1 w-full"
          :class="isNavbar ? 'p-1.5' : 'p-3'"
        >
          <button
            v-for="option in options"
            :key="option.id"
            type="button"
            class="option-btn flex items-center w-full rounded-xl hover:bg-white/5 transition-all text-left group/opt focus:outline-none focus-visible:ring-2 focus-visible:ring-ember-500"
            :class="[
              selectedValues.includes(option.id) ? 'active' : '',
              isNavbar ? 'px-3 py-2' : 'px-6 py-4.5 rounded-[1.25rem]'
            ]"
            :data-value="option.id"
            @click="selectOption(option.id)"
          >
            <div
              class="shrink-0 border border-white/20 flex items-center justify-center transition-all duration-300"
              :class="[
                isMultiple ? 'rounded-lg' : 'rounded-full',
                isNavbar ? 'w-4 h-4 mr-3' : 'w-6 h-6 mr-5',
                selectedValues.includes(option.id) ? 'bg-orange-500 border-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.4)]' : ''
              ]"
            >
              <Check
                class="text-white transition-opacity"
                :class="[
                  isNavbar ? 'h-2.5 w-2.5' : 'h-4 w-4',
                  selectedValues.includes(option.id) ? 'opacity-100' : 'opacity-0'
                ]"
              />
            </div>
            <span
              class="font-bold transition-colors truncate block grow pr-2"
              :class="[
                isNavbar ? 'text-xs' : 'text-base tracking-wide',
                selectedValues.includes(option.id) ? 'text-white' : 'text-gray-400'
              ]"
              :data-i18n="option.i18nKey"
              :data-tag-id="id === 'tag-filter' ? option.id : undefined"
            >
              {{ option.label }}
            </span>
            <div
              v-if="option.color"
              class="ml-auto shrink-0 rounded-full shadow-lg transition-transform group-hover/opt:scale-125"
              :class="option.color"
              :style="{ width: isNavbar ? '6px' : '10px', height: isNavbar ? '6px' : '10px' }"
            />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
