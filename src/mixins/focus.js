export default function(ref) {
  return {
    methods: {
      focus() {
        // 获取组件/元素实例
        this.$refs[ref].focus();
      }
    }
  };
};
