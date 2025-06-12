<template>
  <table class="draggable-table">
    <thead>
      <tr>
        <th v-for="col in columns" :key="col">{{ col }}</th>
      </tr>
    </thead>
    <tbody
      @dragover.prevent
      @drop.prevent="onDrop"
      ref="tbodyRef"
    >
      <template v-for="(row, index) in tableDataWithPlaceholder" :key="index">
        <tr v-if="row.姓名 === '' && row.年龄 === 0" class="placeholder">
          <td :colspan="columns.length" style="text-align: center;">
            拖动到这里
          </td>
        </tr>

        <tr
          v-else
          class="draggable-row"
          :data-index="index"
          draggable="true"
          @dragstart="onDragStart($event)"
          @dragend="onDragEnd($event)"
        >
          <td v-for="col in columns" :key="col">
            {{ row[col] }}
          </td>
        </tr>
      </template>
    </tbody>
  </table>
</template>

<script setup lang="ts">
import { moveTable } from './MovableTable.ts'

const initialData = [
  { 姓名: '张三', 年龄: 28, 职位: '工程师', 部门: '技术部', 入职时间: '2020-03-01' },
  { 姓名: '李四', 年龄: 32, 职位: '产品经理', 部门: '产品部', 入职时间: '2019-07-15' },
  { 姓名: '王五', 年龄: 25, 职位: '设计师', 部门: '设计部', 入职时间: '2021-09-10' },
  { 姓名: '赵六', 年龄: 30, 职位: '测试工程师', 部门: '质量部', 入职时间: '2020-11-20' },
  { 姓名: '钱七', 年龄: 27, 职位: '前端开发', 部门: '技术部', 入职时间: '2022-02-14' },
  { 姓名: '孙八', 年龄: 35, 职位: '架构师', 部门: '技术部', 入职时间: '2018-05-01' },
  { 姓名: '周九', 年龄: 29, 职位: 'UI 设计师', 部门: '设计部', 入职时间: '2021-01-10' },
  { 姓名: '吴十', 年龄: 31, 职位: '运维工程师', 部门: '运维部', 入职时间: '2019-12-25' },
  { 姓名: '郑十一', 年龄: 26, 职位: '实习生', 部门: '技术部', 入职时间: '2023-08-01' },
  { 姓名: '王十二', 年龄: 24, 职位: '助理', 部门: '行政部', 入职时间: '2023-01-01' }
]

const {
  columns,
  tableDataWithPlaceholder,
  tbodyRef,
  onDragStart,
  onDragEnd,
  onDrop
} = moveTable(initialData)
</script>

<style lang="scss" scoped>
.draggable-table {
  width: 100%;
  border-collapse: collapse;
  font-family: Arial, sans-serif;

  th,
  td {
    padding: 12px;
    text-align: left;
    border-bottom: 1px solid #ddd;
  }

  .draggable-row {
    cursor: grab;
    transition: opacity 0.2s ease-in-out;

    &.dragging {
      opacity: 0.5;
    }
  }

  .placeholder td {
    background-color: #e9f5ff;
    color: #007bff;
    font-weight: bold;
  }
}
</style>
