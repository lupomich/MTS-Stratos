import React from 'react'

const DockablePanelShell = ({
  title,
  className = '',
  isFullScreen = false,
  onToggleFullScreen,
  onClose,
  children
}) => {
  return (
    <div className={`dockable-panel-shell ${className}`.trim()}>
      <div className="dockable-panel-header">
        <span className="dockable-panel-title">{title}</span>
        <div className="dockable-panel-actions">
          {onToggleFullScreen && (
            <button
              type="button"
              className="dockable-panel-action"
              onClick={onToggleFullScreen}
              aria-label={isFullScreen ? 'Close Full Screen' : 'Full Screen'}
              title={isFullScreen ? 'Close Full Screen' : 'Full Screen'}
            >
              {isFullScreen ? (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 3 9 9 3 9" />
                  <line x1="9" y1="9" x2="3" y2="3" />
                  <polyline points="15 3 15 9 21 9" />
                  <line x1="15" y1="9" x2="21" y2="3" />
                  <polyline points="9 21 9 15 3 15" />
                  <line x1="9" y1="15" x2="3" y2="21" />
                  <polyline points="15 21 15 15 21 15" />
                  <line x1="15" y1="15" x2="21" y2="21" />
                </svg>
              ) : (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="14" y1="10" x2="21" y2="3" />
                  <polyline points="9 21 3 21 3 15" />
                  <line x1="10" y1="14" x2="3" y2="21" />
                  <polyline points="3 9 3 3 9 3" />
                  <line x1="3" y1="3" x2="10" y2="10" />
                  <polyline points="21 15 21 21 15 21" />
                  <line x1="14" y1="14" x2="21" y2="21" />
                </svg>
              )}
            </button>
          )}
          {onClose && (
            <button
              type="button"
              className="dockable-panel-action"
              onClick={onClose}
              aria-label="Close"
              title="Close"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>
      </div>
      <div className="dockable-panel-content">{children}</div>
    </div>
  )
}

export default DockablePanelShell
