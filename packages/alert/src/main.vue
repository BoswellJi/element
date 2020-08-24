<template>
  <transition name="el-alert-fade">
    <div
      class="el-alert"
      :class="[typeClass, center ? 'is-center' : '', 'is-' + effect]"
      v-show="visible"
      role="alert"
    >
      <i class="el-alert__icon" :class="[ iconClass, isBigIcon ]" v-if="showIcon"></i>
      <div class="el-alert__content">
        <span class="el-alert__title" :class="[ isBoldTitle ]" v-if="title || $slots.title">
          <slot name="title">{{ title }}</slot>
        </span>
        <p class="el-alert__description" v-if="$slots.default && !description">
          <slot></slot>
        </p>
        <p class="el-alert__description" v-if="description && !$slots.default">{{ description }}</p>
        <i
          class="el-alert__closebtn"
          :class="{ 'is-customed': closeText !== '', 'el-icon-close': closeText === '' }"
          v-show="closable"
          @click="close()"
        >{{closeText}}</i>
      </div>
    </div>
  </transition>
</template>

<script type="text/babel">
// 警告组件

// 警告类型，成功，警告，错误
const TYPE_CLASSES_MAP = {
  success: "el-icon-success",
  warning: "el-icon-warning",
  error: "el-icon-error",
};

export default {
  name: "ElAlert",

  props: {
    // 标题
    title: {
      type: String,
      default: "",
    },
    // 文本描述
    description: {
      type: String,
      default: "",
    },
    // 主题类型
    type: {
      type: String,
      default: "info",
    },
    // 是否可关闭
    closable: {
      type: Boolean,
      default: true,
    },
    // 关闭按钮的文本
    closeText: {
      type: String,
      default: "",
    },
    // 是否展示图标
    showIcon: Boolean,
    // 文本是否居中
    center: Boolean,
    // 选择提供的主题
    effect: {
      type: String,
      default: "light",
      // 验证主题是否是现存的
      validator: function (value) {
        return ["light", "dark"].indexOf(value) !== -1;
      },
    },
  },

  data() {
    return {
      visible: true,
    };
  },

  methods: {
    // 关闭弹框，并发射关闭事件
    close() {
      this.visible = false;
      this.$emit("close");
    },
  },

  computed: {
    // 根据主题类型，选择样式
    typeClass() {
      return `el-alert--${this.type}`;
    },

    // 根据弹框类型，选择样式
    iconClass() {
      return TYPE_CLASSES_MAP[this.type] || "el-icon-info";
    },
    
    // 存在辅助性描述文本时，将icon变大，标题变粗

    // 是否存在辅助性文字，有文字，就返回存在文本指定样式，没有就不返回
    isBigIcon() {
      return this.description || this.$slots.default ? "is-big" : "";
    },

    // 是否存在辅助性文字，有文字，就返回存在文本指定样式，没有就不返回
    isBoldTitle() {
      return this.description || this.$slots.default ? "is-bold" : "";
    },
  },
};
</script>
