import React from 'react'

const SortIndicatorHeader = (props) => {
  const { column, enableSorting } = props
  const { sort } = column
  
  const getSortIcon = () => {
    if (!sort) return null
    if (sort === 'asc') {
      return <span style={{ marginLeft: '4px', color: '#00d4ff' }}>▲</span>
    }
    if (sort === 'desc') {
      return <span style={{ marginLeft: '4px', color: '#00d4ff' }}>▼</span>
    }
    return null
  }
  
  return (
    <div style={{ display: 'flex', alignItems: 'center', cursor: enableSorting ? 'pointer' : 'default' }}>
      <span>{props.displayName}</span>
      {getSortIcon()}
    </div>
  )
}

export default SortIndicatorHeader
