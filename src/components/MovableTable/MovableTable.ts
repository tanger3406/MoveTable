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
  draggingIndices: number[] | null
  targetIndex: number | null
  showPlaceholder: boolean
}

export function moveTable(initialData: TableRow[]) {
  const tableData = ref<TableRow[]>([...initialData])
  const tbodyRef = ref<HTMLTableSectionElement | null>(null)
  const selectedRows = ref<number[]>([])
  const columns = ['姓名', '年龄', '职位', '部门', '入职时间']

  const dragState = ref<DragState>({
    draggingIndices: null,
    targetIndex: null,
    showPlaceholder: false
  })

  const tableDataWithPlaceholder = computed(() => {
    if (
      dragState.value.draggingIndices === null ||
      dragState.value.targetIndex === null
    ) {
      return [...tableData.value]
    }

    const copy = [...tableData.value]
    const insertIndex = Math.min(dragState.value.targetIndex!, copy.length)
    for (let i = 0; i < dragState.value.draggingIndices.length; i++) {
      copy.splice(insertIndex + i, 0, {
        姓名: '',
        年龄: 0,
        职位: '',
        部门: '',
        入职时间: ''
      })
    }

    return copy
  })

  watch(tableData, () => {
    queueMicrotask(() => {
      updateRowIndices()
    })
  }, { deep: true })

  function onDragStart(e: DragEvent) {
    if (selectedRows.value.length === 0) return

    dragState.value.draggingIndices = selectedRows.value
    e.dataTransfer?.setData('text/plain', selectedRows.value.join(','))

    selectedRows.value.forEach(index => {
      const tr = tbodyRef.value?.querySelector(`tr[data-index="${index}"]`)
      if (tr) tr.classList.add('dragging')
    })
  }

  function onDragEnd(e: DragEvent) {
    if (dragState.value.draggingIndices) {
      dragState.value.draggingIndices.forEach(index => {
        const tr = tbodyRef.value?.querySelector(`tr[data-index="${index}"]`)
        if (tr) tr.classList.remove('dragging')
      })
    }

    dragState.value.draggingIndices = null
    dragState.value.targetIndex = null
    dragState.value.showPlaceholder = false
    selectedRows.value = []
  }

  function onDrop(e: DragEvent) {
    const draggingIndices = dragState.value.draggingIndices
    const targetIndex = dragState.value.targetIndex

    if (draggingIndices === null || targetIndex === null) return

    const adjustedTargetIndex = targetIndex > draggingIndices[0]
    ? Math.min(targetIndex - draggingIndices.length, tableData.value.length)
    : targetIndex

    const movedItems = draggingIndices.map(index => tableData.value[index])
    draggingIndices.sort((a, b) => b - a).forEach(index => {
      tableData.value.splice(index, 1)
    })

    movedItems.reverse().forEach(item => {
      tableData.value.splice(adjustedTargetIndex, 0, item)
    })

    resetDragState()
    resetAllRowStates()
    rowOrderChange()
  }

  function updateRowIndices() {
    if (!tbodyRef.value) return

    const rows = tbodyRef.value.querySelectorAll('tr')
    const updates: [HTMLElement, string][] = []

    rows.forEach((row, index) => {
      if (row instanceof HTMLElement) {
        updates.push([row, index.toString()])
      }
    })

    updates.forEach(([row, index]) => {
      row.dataset.index = index
    })
  }

  function resetDragState() {
    dragState.value.draggingIndices = null
    dragState.value.targetIndex = null
    dragState.value.showPlaceholder = false
  }

  let cachedRect: DOMRect | null = null
  function handleDragOver(e: DragEvent) {
    const tr = (e.target as HTMLElement).closest('tr')
    if (!tr || dragState.value.draggingIndices === null) return

    if (!cachedRect) {
      cachedRect = tr.getBoundingClientRect()
    }
    const offsetY = e.clientY - cachedRect.top
    const middleY = cachedRect.height / 2

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
      cachedRect = null
    }
  }

  function toggleRowSelection(index: number) {
    if (selectedRows.value.includes(index)) {
      selectedRows.value = selectedRows.value.filter(i => i !== index)
    } else {
      selectedRows.value.push(index)
    }
  }

  function resetAllRowStates() {
    if (!tbodyRef.value) return
    const rows = tbodyRef.value.querySelectorAll('.draggable-row')
    rows.forEach(row => {
      row.classList.remove('dragging')
    })
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
    toggleRowSelection,
    selectedRows
  }
}