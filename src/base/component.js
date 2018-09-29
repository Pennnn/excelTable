export default {
    data () {
        return {
            width: this.defaultWidth,
            height: this.defaultHeight,
            disabled: this.defaultDisabled,
            permissionDisabled: this.defaultPermissionDisabled,
            hidden: this.defaultHidden
        };
    },

    props: {
        cls: {},
        defaultHidden: {
            type: Boolean,
            'default': false
        },
        defaultDisabled: Boolean,
        defaultPermissionDisabled: Boolean,
        defaultWidth: [Number, String],
        defaultHeight: [Number, String]
    },

    computed: {

    },


    methods: {

        /**
         * 禁用
         * @param {Boolean} silent 是否抛出事件
         */
        disable (silent = false) {
            if (this.disabled) {
                return;
            }
            this.disabled = true;
            if (!silent) {
                this.$emit('disable', this);
            }
        },

        /**
         * 禁用 多加一个permissionDisabled属性来控制disabled
         */
        permissionDisable () {
            if (this.permissionDisabled) {
                return;
            }
            this.permissionDisabled = true;
        },

        /**
         * 启用
         * @param {Boolean} silent 是否抛出事件
         */
        enable (silent = false) {
            if (!this.disabled) {
                return;
            }
            this.disabled = false;
            if (!silent) {
                this.$emit('enable', this);
            }
        },

        /**
         * 显示
         * @param {Boolean} silent 是否抛出事件
         */
        show (silent) {
            this.hidden = false;
            if (!silent) {
                this.$emit('show', this);
            }
        },

        /**
         * 隐藏
         * @param {Boolean} silent 是否抛出事件
         */
        hide (silent) {
            this.hidden = true;
            if (!silent) {
                this.$emit('hide', this);
            }
        },

        /**
         * 判断组件是否显示，会向上遍历组件树，对于dom中自己设置的则无法处理
         * @return {Boolean} 是否显示
         */
        isVisibility () {
            let visibility = true;
            let p = this;
            while (p) {
                if (p.hidden) {
                    visibility = false;
                    break;
                }
                p = p.$parent;
            }
            return visibility;
        }
    },

    watch: {

        /**
         * 外部单向绑定触发
         * @param {Boolean} value 隐藏显示
         */
        defaultHidden (value) {
            this.hidden = value;
        },

        /**
         * 外部单向绑定触发
         * @param {Boolean} value 启用禁用
         */
        defaultDisabled (value) {
            this.disabled = value;
        },

        /**
         * 外部单向绑定触发
         * @param {Boolean} value 宽度
         */
        defaultWidth (value) {
            this.width = value;
        },

        /**
         * 外部单向绑定触发
         * @param {Boolean} value 高度
         */
        defaultHeight (value) {
            this.height = value;
        }
    }
};
