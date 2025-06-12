import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'

export interface TableRow {
  姓名: string
  年龄: number
  职位: string
  部门: string
  入职时间: string
  [key: string]: any
}

interface DragState {
  draggingIndex: number | null
  targetIndex: number | null
  showPlaceholder: boolean
}

export function moveTable(initialData: TableRow[]) {
  const tableData = ref<TableRow[]>([...initialData])
  const tbodyRef = ref<HTMLTableSectionElement | null>(null)

  const columns = ['姓名', '年龄', '职位', '部门', '入职时间']

  const dragState = ref<DragState>({
    draggingIndex: null,
    targetIndex: null,
    showPlaceholder: false
  })

  const tableDataWithPlaceholder = computed(() => {
    if (
      dragState.value.draggingIndex === null ||
      dragState.value.targetIndex === null
    ) {
      return [...tableData.value]
    }

    const copy = [...tableData.value]
    const insertIndex = Math.min(dragState.value.targetIndex!, copy.length)
    copy.splice(insertIndex, 0, {
      姓名: '',
      年龄: 0,
      职位: '',
      部门: '',
      入职时间: ''
    })

    return copy
  })

  watch(tableData, () => {
    setTimeout(() => {
      updateRowIndices()
    }, 0)
  }, { deep: true })

  function onDragStart(e: DragEvent) {
    const tr = (e.target as HTMLElement).closest('tr')
    if (!tr || tr.dataset.index === undefined) return

    const index = parseInt(tr.dataset.index)
    dragState.value.draggingIndex = index
    e.dataTransfer?.setData('text/plain', index.toString())
    tr.classList.add('dragging')
  }

  function onDragEnd(e: DragEvent) {
    const target = e.target as HTMLElement
    const tr = target.closest('tr')
    if (tr) tr.classList.remove('dragging')

    dragState.value.draggingIndex = null
    dragState.value.targetIndex = null
    dragState.value.showPlaceholder = false
  }

  function onDrop(e: DragEvent) {
    const draggingIndex = dragState.value.draggingIndex
    const targetIndex = dragState.value.targetIndex

    if (draggingIndex === null || targetIndex === null) return

    const adjustedTargetIndex = targetIndex > draggingIndex
    ? Math.min(targetIndex - 1, tableData.value.length)
    : targetIndex

    const movedItem = tableData.value.splice(draggingIndex, 1)[0]
    tableData.value.splice(adjustedTargetIndex, 0, movedItem)

    resetDragState()
    rowOrderChange()
  }

  function updateRowIndices() {
    if (!tbodyRef.value) return

    const rows = tbodyRef.value.querySelectorAll('tr')
    rows.forEach((row, index) => {
      if (row instanceof HTMLElement) {
        row.dataset.index = index.toString()
      }
    })
  }

  function resetDragState() {
    dragState.value.draggingIndex = null
    dragState.value.targetIndex = null
    dragState.value.showPlaceholder = false
  }

  function handleDragOver(e: DragEvent) {
    const tr = (e.target as HTMLElement).closest('tr')
    if (!tr || dragState.value.draggingIndex === null) return

    const rect = tr.getBoundingClientRect()
    const offsetY = e.clientY - rect.top
    const middleY = rect.height / 2

    const rows = Array.from(tbodyRef.value?.querySelectorAll('tr') || [])
    const targetIndex = rows.indexOf(tr)

    if (targetIndex === -1) return

    if (offsetY < middleY) {
      dragState.value.targetIndex = targetIndex
    } else {
      dragState.value.targetIndex = targetIndex + 1
    }

    dragState.value.showPlaceholder = true
  }

  function handleDragLeave(e: DragEvent) {
    const tr = (e.target as HTMLElement).closest('tr')
    if (!tr || tr.classList.contains('placeholder')) return

    if (e.relatedTarget === null || !tbodyRef.value?.contains(e.relatedTarget as Node)) {
      dragState.value.showPlaceholder = false
    }
  }

  onMounted(() => {
    if (!tbodyRef.value) return

    tbodyRef.value.addEventListener('dragover', handleDragOver)
    tbodyRef.value.addEventListener('dragleave', handleDragLeave)

    updateRowIndices()
  })

  onBeforeUnmount(() => {
    if (!tbodyRef.value) return

    tbodyRef.value.removeEventListener('dragover', handleDragOver)
    tbodyRef.value.removeEventListener('dragleave', handleDragLeave)
  })

  function rowOrderChange() {

  }

  return {
    columns,
    tableDataWithPlaceholder,
    tbodyRef,
    onDragStart,
    onDragEnd,
    onDrop,
  }
}