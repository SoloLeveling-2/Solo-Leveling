import { createContext, useCallback, useContext, useState } from 'react';

const ConfirmContext = createContext({ confirm: async () => false });

export function ConfirmProvider({ children }) {
  const [state, setState] = useState(null);

  const confirm = useCallback((opts) => {
    return new Promise((resolve) => {
      setState({ ...opts, resolve });
    });
  }, []);

  const close = (result) => {
    state?.resolve(result);
    setState(null);
  };

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      {state && (
        <div className="modal-backdrop" onClick={() => close(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <span className="modal-mark">[ {state.title || 'Confirm'} ]</span>
            </div>
            <div className="modal-body">{state.message}</div>
            <div className="modal-actions">
              <button className="ghost" onClick={() => close(false)}>{state.cancelText || 'Cancel'}</button>
              <button className={state.danger ? 'danger' : 'primary'} onClick={() => close(true)}>
                {state.confirmText || 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  return useContext(ConfirmContext).confirm;
}
