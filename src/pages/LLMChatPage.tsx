import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Send,
  Loader2,
  Link as LinkIcon,
  FileText,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ShieldCheck,
  RefreshCcw,
} from 'lucide-react';
import './LLMChatPage.css';

const CHAT_ENDPOINT = (import.meta.env.VITE_LLM_CHAT_ENDPOINT as string | undefined) ?? '/api/llm/requests';
const STATUS_ENDPOINT = (import.meta.env.VITE_LLM_STATUS_ENDPOINT as string | undefined) ?? '/api/llm/requests';
const CALLBACK_STREAM_BASE = (import.meta.env.VITE_LLM_CALLBACK_STREAM_BASE as string | undefined) ?? '';
const CALLBACK_PROXY = (import.meta.env.VITE_LLM_CALLBACK_PROXY as string | undefined) ?? '';

type RequestStatus = 'queued' | 'processing' | 'ready' | 'failed';

type ChatRole = 'user' | 'system';

type LLMCallbackPayload = {
  requestId: string;
  status: RequestStatus;
  fileUrl?: string;
  detail?: string;
  progress?: number;
  timestamp?: string;
};

type CreateRequestResponse = {
  requestId: string;
  status?: RequestStatus;
  callbackChannel?: string;
  message?: string;
};

type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
  timestamp: string;
  requestId?: string;
  status?: RequestStatus;
  fileUrl?: string;
  detail?: string;
};

type RequestEvent = {
  id: string;
  status: RequestStatus;
  timestamp: string;
  detail?: string;
  fileUrl?: string;
};

type LLMRequest = {
  id: string;
  prompt: string;
  status: RequestStatus;
  createdAt: string;
  lastUpdate: string;
  callbackChannel?: string;
  events: RequestEvent[];
  fileUrl?: string;
};

const trimTrailingSlash = (value: string) => value?.replace(/\/$/, '') ?? '';

const generateId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `llm-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const resolveCallbackUrl = (): string => {
  if (CALLBACK_PROXY) {
    return trimTrailingSlash(CALLBACK_PROXY);
  }

  if (typeof window !== 'undefined') {
    return `${window.location.origin}/api/llm/callback`;
  }

  return '';
};

const renderStatusIcon = (status: RequestStatus) => {
  switch (status) {
    case 'queued':
      return <Clock size={16} />;
    case 'processing':
      return <Loader2 size={16} className="llm-spin" />;
    case 'ready':
      return <CheckCircle2 size={16} />;
    case 'failed':
      return <AlertTriangle size={16} />;
    default:
      return null;
  }
};

const LLMChatPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [inputValue, setInputValue] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [requests, setRequests] = useState<LLMRequest[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const eventSourcesRef = useRef<Record<string, EventSource>>({});
  const pollersRef = useRef<Record<string, number>>({});

  const callbackUrl = useMemo(resolveCallbackUrl, []);
  const callbackChannelFactory = useCallback((requestId: string) => {
    if (!CALLBACK_STREAM_BASE) {
      return undefined;
    }

    const base = trimTrailingSlash(CALLBACK_STREAM_BASE);
    return `${base}/stream/${requestId}`;
  }, []);

  const requestStatusToLabel = useCallback((status: RequestStatus) => {
    switch (status) {
      case 'queued':
        return t('llm_chat_status_queued');
      case 'processing':
        return t('llm_chat_status_processing');
      case 'ready':
        return t('llm_chat_status_ready');
      case 'failed':
        return t('llm_chat_status_failed');
      default:
        return status;
    }
  }, [t]);

  const stopPolling = useCallback((requestId: string) => {
    const pollerId = pollersRef.current[requestId];
    if (pollerId) {
      clearInterval(pollerId);
      delete pollersRef.current[requestId];
    }
  }, []);

  const closeEventChannel = useCallback((requestId: string) => {
    const source = eventSourcesRef.current[requestId];
    if (source) {
      source.close();
      delete eventSourcesRef.current[requestId];
    }
  }, []);

  const handleIncomingPayload = useCallback((payload: LLMCallbackPayload) => {
    setRequests((prev) => prev.map((request) => {
      if (request.id !== payload.requestId) {
        return request;
      }

      const timestamp = payload.timestamp ?? new Date().toISOString();
      const event: RequestEvent = {
        id: generateId(),
        status: payload.status,
        timestamp,
        detail: payload.detail,
        fileUrl: payload.fileUrl,
      };

      const nextEvents = [event, ...request.events];
      const nextRequest: LLMRequest = {
        ...request,
        status: payload.status,
        lastUpdate: timestamp,
        events: nextEvents,
        fileUrl: payload.fileUrl ?? request.fileUrl,
      };

      return nextRequest;
    }));

    if (payload.status === 'ready' && payload.fileUrl) {
      closeEventChannel(payload.requestId);
      setChatMessages((prev) => [
        ...prev,
        {
          id: generateId(),
          role: 'system',
          content: t('llm_chat_message_ready'),
          timestamp: new Date().toISOString(),
          requestId: payload.requestId,
          status: payload.status,
          fileUrl: payload.fileUrl,
          detail: payload.detail,
        },
      ]);
      stopPolling(payload.requestId);
    }

    if (payload.status === 'failed') {
      closeEventChannel(payload.requestId);
      setChatMessages((prev) => [
        ...prev,
        {
          id: generateId(),
          role: 'system',
          content: t('llm_chat_message_failed'),
          timestamp: new Date().toISOString(),
          requestId: payload.requestId,
          status: payload.status,
          detail: payload.detail,
        },
      ]);
      stopPolling(payload.requestId);
    }
  }, [closeEventChannel, stopPolling, t]);

  const pollStatus = useCallback((requestId: string) => {
    if (!STATUS_ENDPOINT) {
      return;
    }

    stopPolling(requestId);

    const base = trimTrailingSlash(STATUS_ENDPOINT);

    const pollerId = window.setInterval(async () => {
      try {
        const response = await fetch(`${base}/${requestId}`);
        if (!response.ok) {
          throw new Error('Status request failed');
        }

        const payload = await response.json() as LLMCallbackPayload;
        if (payload?.status) {
          handleIncomingPayload(payload);
        }
      } catch (error) {
        console.error('LLM status poll error', error);
      }
    }, 4500);

    pollersRef.current[requestId] = pollerId;
  }, [handleIncomingPayload, stopPolling]);

  const subscribeToChannel = useCallback((channelUrl: string | undefined, requestId: string) => {
    if (!channelUrl || typeof window === 'undefined') {
      return;
    }

    if (!('EventSource' in window)) {
      pollStatus(requestId);
      return;
    }

    const eventSource = new EventSource(channelUrl);
    eventSource.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data) as LLMCallbackPayload;
        handleIncomingPayload(payload);
      } catch (error) {
        console.error('LLM callback parse error', error);
      }
    };

    eventSource.onerror = () => {
      eventSource.close();
      delete eventSourcesRef.current[requestId];
      pollStatus(requestId);
    };

    eventSourcesRef.current[requestId] = eventSource;
  }, [handleIncomingPayload, pollStatus]);

  const appendUserMessage = useCallback((prompt: string) => {
    setChatMessages((prev) => [
      ...prev,
      {
        id: generateId(),
        role: 'user',
        content: prompt,
        timestamp: new Date().toISOString(),
      },
    ]);
  }, []);

  const appendSystemMessage = useCallback((content: string, requestId?: string) => {
    setChatMessages((prev) => [
      ...prev,
      {
        id: generateId(),
        role: 'system',
        content,
        timestamp: new Date().toISOString(),
        requestId,
      },
    ]);
  }, []);

  const handleSubmit = useCallback(async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    const trimmed = inputValue.trim();
    if (!trimmed || isSubmitting) {
      return;
    }

    appendUserMessage(trimmed);
    setIsSubmitting(true);

    try {
      const response = await fetch(CHAT_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: trimmed,
          locale: i18n.language,
          callbackUrl,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create request');
      }

      const data = await response.json() as CreateRequestResponse;
      const requestId = data.requestId;
      const createdAt = new Date().toISOString();
      const initialStatus: RequestStatus = data.status ?? 'queued';

      const newRequest: LLMRequest = {
        id: requestId,
        prompt: trimmed,
        status: initialStatus,
        createdAt,
        lastUpdate: createdAt,
        callbackChannel: data.callbackChannel ?? callbackChannelFactory(requestId),
        events: [
          {
            id: generateId(),
            status: initialStatus,
            timestamp: createdAt,
            detail: data.message ?? t('llm_chat_request_created'),
          },
        ],
      };

      setRequests((prev) => [newRequest, ...prev]);
      appendSystemMessage(t('llm_chat_request_registered'), requestId);

      if (newRequest.callbackChannel) {
        subscribeToChannel(newRequest.callbackChannel, requestId);
      } else {
        pollStatus(requestId);
      }

      setInputValue('');
    } catch (error) {
      console.error(error);
      setFormError(t('llm_chat_request_failed'));
      appendSystemMessage(t('llm_chat_request_failed'));
    } finally {
      setIsSubmitting(false);
    }
  }, [appendSystemMessage, appendUserMessage, callbackChannelFactory, callbackUrl, i18n.language, inputValue, pollStatus, subscribeToChannel, t, isSubmitting]);

  useEffect(() => () => {
    Object.values(eventSourcesRef.current).forEach((source) => {
      source?.close();
    });
    Object.values(pollersRef.current).forEach((intervalId) => {
      clearInterval(intervalId);
    });
  }, []);

  return (
    <div className="llm-chat-page">
      <section className="llm-hero">
        <div className="llm-hero-header">
          <p className="llm-kicker">{t('llm_chat_kicker')}</p>
          <h1>{t('llm_chat_title')}</h1>
          <p className="llm-subtitle">{t('llm_chat_subtitle')}</p>
        </div>
        <div className="llm-hero-grid">
          <div className="llm-meta">
            <div className="llm-meta-card">
              <ShieldCheck size={20} />
              <span>{t('llm_chat_meta_secure')}</span>
            </div>
            <div className="llm-meta-card">
              <FileText size={20} />
              <span>{t('llm_chat_meta_docs')}</span>
            </div>
            <div className="llm-meta-card">
              <RefreshCcw size={20} />
              <span>{t('llm_chat_meta_async')}</span>
            </div>
          </div>
          <div className="llm-callback-card" aria-live="polite">
            <p className="llm-hero-label">{t('llm_chat_callback_label')}</p>
            <p className="llm-hero-value">{callbackUrl || t('llm_chat_callback_placeholder')}</p>
            <span className="llm-hero-hint">{t('llm_chat_callback_hint')}</span>
          </div>
        </div>
      </section>

      <div className="llm-grid">
        <section className="llm-chat-panel" aria-label={t('llm_chat_panel_label')}>
          <div className="llm-chat-window">
            {chatMessages.length === 0 ? (
              <div className="llm-chat-empty">
                <p>{t('llm_chat_empty_state')}</p>
              </div>
            ) : (
              chatMessages.map((message) => (
                <div
                  key={message.id}
                  className={`llm-message llm-message-${message.role}`}
                >
                  <div className="llm-message-meta">
                    <span>{message.role === 'user' ? t('llm_chat_user_label') : t('llm_chat_system_label')}</span>
                    <span>{new Date(message.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <p>{message.content}</p>
                  {message.detail && <p className="llm-message-detail">{message.detail}</p>}
                  {message.fileUrl && (
                    <a href={message.fileUrl} target="_blank" rel="noreferrer" className="llm-file-link">
                      <FileText size={16} />
                      <span>{t('llm_chat_open_file')}</span>
                    </a>
                  )}
                  {message.status && (
                    <span className={`llm-status-badge status-${message.status}`}>
                      {renderStatusIcon(message.status)}
                      {requestStatusToLabel(message.status)}
                    </span>
                  )}
                </div>
              ))
            )}
          </div>

          <form className="llm-chat-form" onSubmit={handleSubmit}>
            <label htmlFor="llmPrompt" className="sr-only">
              {t('llm_chat_input_label')}
            </label>
            <textarea
              id="llmPrompt"
              placeholder={t('llm_chat_input_placeholder')}
              value={inputValue}
              onChange={(event) => setInputValue(event.target.value)}
              rows={4}
              disabled={isSubmitting}
            />
            {formError && <p className="llm-error-text">{formError}</p>}
            <div className="llm-form-actions">
              <button type="submit" className="llm-send-button" disabled={isSubmitting || !inputValue.trim()}>
                {isSubmitting ? <Loader2 size={18} className="llm-spin" /> : <Send size={18} />}
                <span>{t('llm_chat_send_button')}</span>
              </button>
            </div>
          </form>
        </section>

        <section className="llm-status-panel" aria-label={t('llm_chat_status_panel_label')}>
          <div className="llm-panel-header">
            <div>
              <p className="llm-panel-kicker">{t('llm_chat_requests_kicker')}</p>
              <h2>{t('llm_chat_requests_title')}</h2>
            </div>
            <p className="llm-panel-meta">{t('llm_chat_requests_hint')}</p>
          </div>

          {requests.length === 0 ? (
            <div className="llm-status-empty">
              <p>{t('llm_chat_no_requests')}</p>
            </div>
          ) : (
            <ul className="llm-requests-list">
              {requests.map((request) => (
                <li key={request.id} className="llm-request-card">
                  <div className="llm-request-header">
                    <div>
                      <p className="llm-request-id">{request.id}</p>
                      <p className="llm-request-prompt">{request.prompt}</p>
                    </div>
                    <span className={`llm-status-badge status-${request.status}`}>
                      {renderStatusIcon(request.status)}
                      {requestStatusToLabel(request.status)}
                    </span>
                  </div>
                  <div className="llm-request-meta">
                    <span>{t('llm_chat_created_at', { value: new Date(request.createdAt).toLocaleString() })}</span>
                    <span>{t('llm_chat_updated_at', { value: new Date(request.lastUpdate).toLocaleString() })}</span>
                  </div>
                  {request.fileUrl && (
                    <a href={request.fileUrl} target="_blank" rel="noreferrer" className="llm-file-pill">
                      <FileText size={16} />
                      <span>{t('llm_chat_download_file')}</span>
                    </a>
                  )}
                  <ul className="llm-events">
                    {request.events.map((event) => (
                      <li key={event.id}>
                        <span>{new Date(event.timestamp).toLocaleTimeString()}</span>
                        <p>{event.detail ?? requestStatusToLabel(event.status)}</p>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          )}

          <div className="llm-integration-card">
            <p>{t('llm_chat_integration_title')}</p>
            <div className="llm-endpoints">
              <div>
                <span>{t('llm_chat_endpoint_requests')}</span>
                <code>{CHAT_ENDPOINT}</code>
              </div>
              <div>
                <span>{t('llm_chat_endpoint_status')}</span>
                <code>{STATUS_ENDPOINT}</code>
              </div>
              <div>
                <span>{t('llm_chat_endpoint_callback')}</span>
                <code>{callbackUrl || '—'}</code>
              </div>
            </div>
            <p className="llm-integration-hint">
              <LinkIcon size={16} />
              <span>{t('llm_chat_integration_hint')}</span>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default LLMChatPage;
