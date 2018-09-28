<template>
    <div class="wrap" :class="{'full-screen': isFullScreen}">
            <div class="toolbar">
                工具栏
            </div>
        <div class="col-list" ref="colList">
            <div class="col-item" v-for="col in cols" :key="col">{{col}}</div>
        </div>
        <div class="row-list" ref="rowList">
            <div :style="firstStyle"></div>
            <div class="row-item" v-for="(row, index) in showRows"
                 :key="index">{{row}}</div>
            <div :style="lastStyle"></div>
        </div>
        <div class="buffer-view-ct" @scroll="onScroll" ref="wrap">
            <div :style="{'width': 110 * cols.length + 'px'}">
                <div :style="firstStyle"></div>
                <div v-for="(row) in showRows"
                     :key="row"
                     class="table-row">
                    <!--:style="index === 0 ? firstStyle : (index === showRows.length - 1 ? lastStyle : {})">-->
                    <div v-for="col in cols" class="table-cell" :key="col"></div>
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
        border-right: 1px solid #ddd;
    }

    .row-item {
        width: @colBarWidth;
        height: 36px;
    }

    .table-row {
        white-space: nowrap;
    }

    .buffer-view-ct {
        position: relative;
        height: calc(100% - 36px - 48px);
        margin-left: @colBarWidth;
        overflow: hidden;
        /*overflow: auto;*/
        /*-webkit-overflow-scrolling: touch;*/
    }

    .table-cell, .col-item, .row-item {
        border: 1px solid #ddd;
        padding: 0;
        text-align: center;
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

    const ROW_HEIGHT = 36;

    export default {
        mounted() {
            this.$nextTick(() => {
                let iScroll = new IScroll(this.$refs.wrap, {
                    scrollX: true,
                    listenX: true,
                    scrollbars: true,
                    mouseWheel: true,
                    bounce: false,
                    probeType: 3
                });
                iScroll.on('scroll', () => {
                    this.handleScroll(iScroll);
                });
            });
            this.getVisibleItems();
        },
        data () {
            return {
                data : Array.from((Array(300))).map((item, index) => {
                    return index + 1
                }),
                cols: Array.from(Array(26)).map((v, i) => String.fromCharCode(97 + i)),
                scrollTop: 0,
                bufferStart: 0,
                bufferSize: 50,
                visibleItems: 0,

            }
        },
        computed : {
            firstStyle () {
                return {
                    height: this.bufferStart * ROW_HEIGHT + 'px'
                    // marginTop: this.bufferStart * ROW_HEIGHT + 'px'
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
                    // marginBottom: marginBottom + 'px'
                };
            },
            showRows () {
                return this.data.slice(this.bufferStart, this.bufferStart + this.bufferSize);
            },
            isFullScreen () {
                return this.scrollTop > 400;
            }
        },
        methods : {
            onScroll (evt) {

            },
            handleScroll (iScroll) {
                console.log(iScroll.y);
                let scrollTop = Math.abs(iScroll.y),
                    scrollLeft = Math.abs(iScroll.x),
                    i = Math.ceil(scrollTop / ROW_HEIGHT);
                console.log(scrollTop, scrollLeft);
                this.scrollTop = scrollTop;
                if (i + this.visibleItems >= (this.bufferStart + this.bufferSize) || i < this.bufferStart) {
                    this.bufferStart = +(Math.max(i - (this.bufferSize - this.visibleItems) / 2, 0));
                    this.$nextTick(() => {
                        let top = i * ROW_HEIGHT;
                        iScroll.scrollTo(0, -top);
                    });
                }
                this.$nextTick(() => {
                    let scrollTop = Math.abs(iScroll.y),
                        scrollLeft = Math.abs(iScroll.x);
                    this.$refs.rowList.scrollTop = scrollTop;
                    this.$refs.colList.scrollLeft = scrollLeft;
                    iScroll.refresh();
                })
            },
            getVisibleItems () {
                this.visibleItems = Math.ceil(this.$refs.wrap.clientHeight / ROW_HEIGHT)
            }
        },
    }

</script>