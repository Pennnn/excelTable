<template>
    <div class="wrap" :class="{'full-screen': isFullScreen}">
            <div class="toolbar">
                工具栏
            </div>
        <div class="col-list" ref="colList">
            <div :style="{transform: `translate(${scrollLeft}px, 0) translateZ(0px)`}">
                <div class="col-item" v-for="col in cols" :key="col">{{col}}</div>
            </div>
        </div>
        <div class="row-list" ref="rowList">
            <div :style="{transform: `translate(0, ${scrollTop}px) translateZ(0px)`}">
                <div :style="firstStyle"></div>
                <div class="row-item" v-for="(row, index) in showRows"
                     :key="index">{{row}}</div>
                <div :style="lastStyle"></div>
            </div>
        </div>
        <div class="buffer-view-ct" ref="wrap" @touchend="onTouchEnd">
            <div  :style="{'width': 110 * cols.length + 'px'}">
                <div :style="firstStyle"></div>
                <div class="buffer-view-content">
                    <div v-for="(row) in showRows"
                         :key="row"
                         class="table-row">
                        <div v-for="col in cols" class="table-cell" :key="col" contenteditable="true"></div>
                    </div>
                </div>
                <div :style="lastStyle"></div>
            </div>
        </div>
    </div>
</template>
<style lang="less">
    @cellHeight: 36px;
    @cellWidth: 110px;
    @colBarWidth: 50px;

    * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
    }

    html, body, .wrap{
        width: 100%;
        height: 100%;
        overflow: hidden;
    }
    .wrap {
        height: 100vh;
    }

    .toolbar {
        width: 100%;
        height: 48px;
        background-color: #f6f6f6;
    }

    .col-list {
        width: calc(100% - @colBarWidth);
        overflow: hidden;
        height: @cellHeight;
        white-space: nowrap;
        margin-left: @colBarWidth;
        border-left: 1px solid #ddd;
        .col-item:last-child {
            width: 127px;
        }
    }

    .col-item, .table-cell {
        display: inline-block;
        height: @cellHeight;
        width: @cellWidth;
        line-height: @cellHeight;
        vertical-align: top;
    }

    .row-list {
        position: absolute;
        height: calc(100% - 36px - 48px);
        width: @colBarWidth;
        left: 0;
        overflow: hidden;
        border-top: 1px solid #ddd;
    }

    .row-list {
        .row-item:nth-child(2) {
            border-top: none;
        }
    }

    .row-item {
        width: @colBarWidth;
        border-top: 1px solid #ddd;
        height: 36px;
        &:last-child {
            border-top: none;
        }
        &:last-child {
            border-bottom: 1px solid #ddd;
        }
    }

    .table-row {
        white-space: nowrap;
    }

    .buffer-view-ct {
        border-top: 1px solid #ddd;
    }

    .buffer-view-content {
        .table-row:first-child {
            .table-cell {
                border-top: none;
            }
        }
    }

    .buffer-view-ct {
        position: relative;
        height: calc(100% - 36px - 48px);
        margin-left: @colBarWidth;
        overflow: hidden;
        border-left: 1px solid #ddd;
    }

    .table-cell, .row-item {
        border-top: 1px solid #ddd;
        &:last-child {
            border-bottom: none;
        }
        padding: 0;
        text-align: center;
    }
    .table-cell, .col-item{
        text-align: center;
        border-left: 1px solid #ddd;
        &:last-child {
            border-right: 1px solid #ddd;
        }
        &:first-child {
            border-left: none;
        }
    }
    .col-item, .row-item {
        background: #eee;
    }

    .full-screen {
        .toolbar {
            display: none;
        }
        .buffer-view-ct, .row-list {
            height: calc(100% - 36px);
        }
    }
</style>
<script>
    /**
     * App.vue
     * @description: 
     * @author: zengkp
     * @date: 2018/9/26
     */

    /*eslint-disable*/
    import IScroll from 'iscroll/build/iscroll-probe'
    import {throttle} from "./base/delay";

    const ROW_HEIGHT = 36;

    export default {
        data () {
            return {
                data : Array.from((Array(5000))).map((item, index) => {
                    return index + 1
                }),
                cols: Array.from(Array(26)).map((v, i) => String.fromCharCode(97 + i)),
                scrollTop: 0,
                scrollLeft: 0,
                bufferStart: 0,
                bufferSize: 150,
                visibleItems: 0,
            }
        },
        mounted() {
            this.$nextTick(() => {
                let iScroll = new IScroll(this.$refs.wrap, {
                    scrollX: true,
                    listenX: true,
                    mouseWheel: true,
                    bounce: false,
                    probeType: 3
                });
                iScroll.on('scroll', () => {
                    requestAnimationFrame( () => {
                        this.handleScroll(iScroll);
                    })
                });
                iScroll.on('scrollEnd', () => {
                    this.handleScroll(iScroll, true);
                });
                this.iscroll = iScroll;
            });
            this.getVisibleItems();
        },
        computed : {
            firstStyle () {
                return {
                    height: this.bufferStart * ROW_HEIGHT + 'px'
                };
            },
            lastStyle () {
                let data = this.data;
                let marginBottom = 0;
                if (this.bufferStart + this.bufferSize < data.length) {
                    marginBottom = (data.length - this.bufferStart - this.bufferSize) * ROW_HEIGHT;
                }
                return {
                    height: marginBottom + 'px'
                };
            },
            showRows () {
                return this.data.slice(this.bufferStart, this.bufferStart + this.bufferSize);
            },
            isFullScreen () {
                return Math.abs(this.scrollTop) > 400;
            }
        },
        methods : {
            onTouchEnd () {
                this.handleScroll(this.iscroll);
            },
            handleScroll (iScroll, isScrollEnd) {
                const LOAD_LIMIT = 50;
                let scrollTop = Math.abs(iScroll.y),
                    i = Math.ceil(scrollTop / ROW_HEIGHT);
                if (i + this.visibleItems >= (this.bufferStart + this.bufferSize) || i < this.bufferStart) {
                    this.bufferStart = +(Math.max(i - (this.bufferSize - this.visibleItems) / 2, 0));
                }
                if (isScrollEnd && i + this.visibleItems >= this.data.length - LOAD_LIMIT) {
                    this.insertNewData()
                }
                this.$nextTick(() => {
                    this.scrollTop = iScroll.y;
                    this.scrollLeft = iScroll.x;
                    iScroll.refresh();
                })
            },
            insertNewData () {
                let newArr = Array.from((Array(200))).map((item, index) => {
                    return this.data.length + index + 1
                });
                this.data = this.data.concat(newArr);
            },
            getVisibleItems () {
                this.visibleItems = Math.ceil(this.$refs.wrap.clientHeight / ROW_HEIGHT)
            }
        },
    }

</script>