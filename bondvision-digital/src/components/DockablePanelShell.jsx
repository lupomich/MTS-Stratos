/**
 * DockablePanelShell — Chrome wrapper for a single dockable panel.
 *
 * Renders a title bar with optional action buttons (full-screen toggle, close)
 * above the panel's content area. It is purely presentational — no state, no
 * layout logic. Used by DockableWorkspaceGrid for every occupied grid slot.
 *
 * @param {string}        title              Displayed in the header.
 * @param {string}        [className='']     Extra CSS class on the root element.
 * @param {boolean}       [isFullScreen=false]  When true, the full-screen icon shows
 *                                              the "exit full-screen" variant.
 * @param {function}      [onToggleFullScreen]  Called when the full-screen button is
 *                                              clicked. Omit to hide the button.
 * @param {function}      [onClose]             Called when the close (×) button is
 *                                              clicked. Omit to hide the button.
 * @param {React.ReactNode} children           Panel content.
 */
import React from 'react'
import { useLanguage } from '../context/LanguageContext'

const DockablePanelShell = ({
  title,
  className = '',
  isFullScreen = false,
  onToggleFullScreen,
  onClose,
  children
}) => {
  const { t } = useLanguage()
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
              aria-label={isFullScreen ? t('workspace.closeFullScreen') : t('workspace.fullScreen')}
              title={isFullScreen ? t('workspace.closeFullScreen') : t('workspace.fullScreen')}
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
              aria-label={t('workspace.close')}
              title={t('workspace.close')}
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
