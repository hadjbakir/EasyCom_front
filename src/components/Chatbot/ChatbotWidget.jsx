'use client'
import { useState, useRef, useEffect } from 'react'

import {
  Box,
  Fab,
  Paper,
  Typography,
  TextField,
  IconButton,
  Avatar,
  CircularProgress,
  Chip,
  Divider,
  Collapse,
  Fade,
  Zoom
} from '@mui/material'
import {
  Chat as ChatIcon,
  Send as SendIcon,
  Close as CloseIcon,
  SmartToy as BotIcon,
  Refresh as RefreshIcon,
  Remove as RemoveIcon
} from '@mui/icons-material'
import { styled } from '@mui/material/styles'

import useChatbot from '@/hooks/useChatbot'

const FloatingContainer = styled(Box)(({ theme }) => ({
  position: 'fixed',
  bottom: theme.spacing(2),
  right: theme.spacing(2),
  zIndex: 1300,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-end',
  gap: theme.spacing(1)
}))

const ChatWindow = styled(Paper)(({ theme }) => ({
  width: 350,
  maxWidth: 'calc(100vw - 32px)',
  height: 500,
  maxHeight: 'calc(100vh - 100px)',
  display: 'flex',
  flexDirection: 'column',
  borderRadius: theme.spacing(2),
  overflow: 'hidden',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
  border: `1px solid ${theme.palette.divider}`,
  background: theme.palette.background.paper
}))

const chatGradient = 'linear-gradient(135deg, #d86db0 0%, #b35bb5 25%, #8156b7 50%, #824396 75%, #392760 100%)'

const ChatHeader = styled(Box)(({ theme }) => ({
  background: chatGradient,
  color: theme.palette.getContrastText('#8156b7'),
  padding: theme.spacing(1.5, 2),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  minHeight: 56
}))

const MessagesContainer = styled(Box)(({ theme }) => ({
  flex: 1,
  overflowY: 'auto',
  padding: theme.spacing(1),
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1),
  background: theme.palette.grey[50],
  '&::-webkit-scrollbar': {
    width: 4
  },
  '&::-webkit-scrollbar-track': {
    background: 'transparent'
  },
  '&::-webkit-scrollbar-thumb': {
    background: theme.palette.grey[300],
    borderRadius: 2
  }
}))

const MessageBubble = styled(Paper, {
  shouldForwardProp: prop => prop !== 'isUser'
})(({ theme, isUser }) => ({
  padding: theme.spacing(1, 1.5),
  maxWidth: '75%',
  alignSelf: isUser ? 'flex-end' : 'flex-start',
  backgroundColor: isUser ? theme.palette.primary.main : theme.palette.background.paper,
  color: isUser ? theme.palette.primary.contrastText : theme.palette.text.primary,
  borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
  wordWrap: 'break-word',
  boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
  border: isUser ? 'none' : `1px solid ${theme.palette.divider}`
}))

const InputContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  padding: theme.spacing(1.5),
  borderTop: `1px solid ${theme.palette.divider}`,
  background: theme.palette.background.paper
}))

const StyledFab = styled(Fab, {
  shouldForwardProp: prop => prop !== 'isOpen'
})(({ theme, isOpen }) => ({
  background: isOpen ? '#8e839b' : 'linear-gradient(135deg, #bb4edc 0%, #d86db0 100%)',
  color: theme.palette.getContrastText('#8156b7'),
  '&:hover': {
    background: isOpen ? '#623e91' : 'linear-gradient(135deg, #d86db0 0%, #b35bb5 100%)',
    transform: 'scale(1.05)'
  },
  transition: 'all 0.2s ease-in-out',
  boxShadow: '0 4px 16px rgba(136, 76, 175, 0.25)'
}))

const QuickReplies = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  gap: theme.spacing(0.5),
  padding: theme.spacing(0, 1),
  marginBottom: theme.spacing(1)
}))

const NotificationBadge = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: -4,
  right: -4,
  backgroundColor: theme.palette.error.main,
  color: theme.palette.error.contrastText,
  borderRadius: '50%',
  width: 20,
  height: 20,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '0.75rem',
  fontWeight: 'bold',
  animation: 'pulse 2s infinite',
  '@keyframes pulse': {
    '0%': {
      transform: 'scale(1)'
    },
    '50%': {
      transform: 'scale(1.1)'
    },
    '100%': {
      transform: 'scale(1)'
    }
  }
}))

const quickQuestions = [
  'What is EasyCom?',
  'How does AI search work?',
  'Pricing plans?',
  'Join as supplier?',
  'Available services?',
  'Multi-store management?'
]

const ChatbotWidget = () => {
  const [open, setOpen] = useState(false)
  const [minimized, setMinimized] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [unreadCount, setUnreadCount] = useState(0)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  const { messages, isLoading, sendMessage, resetChat, addWelcomeMessage } = useChatbot()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (open && !minimized) {
      addWelcomeMessage()
      setUnreadCount(0)
    }
  }, [open, minimized, addWelcomeMessage])

  // Simulate new message notifications when chat is closed
  useEffect(() => {
    if (!open && messages.length > 1) {
      const lastMessage = messages[messages.length - 1]

      if (!lastMessage.isUser) {
        setUnreadCount(prev => prev + 1)
      }
    }
  }, [messages, open])

  const handleToggleChat = () => {
    if (open) {
      setOpen(false)
      setMinimized(false)
    } else {
      setOpen(true)
      setMinimized(false)
      setUnreadCount(0)
    }
  }

  const handleMinimize = () => {
    setMinimized(!minimized)
  }

  const handleSubmit = e => {
    e.preventDefault()

    if (inputValue.trim()) {
      handleSendMessage(inputValue)
    }
  }

  const handleSendMessage = messageText => {
    sendMessage(messageText)
    setInputValue('')
    setUnreadCount(0)
  }

  const handleQuickQuestion = question => {
    handleSendMessage(question)
  }

  const handleReset = () => {
    resetChat()
    setInputValue('')
  }

  const formatTime = timestamp => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <FloatingContainer>
      <Zoom in={open} timeout={200}>
        <ChatWindow sx={{ display: open ? 'flex' : 'none' }}>
          <ChatHeader>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Avatar sx={{ width: 32, height: 32, bgcolor: '#fff' }}>
                <img
                  src='/images/chatbot/chatbot.png'
                  alt='Chatbot'
                  style={{ width: 28, height: 28, objectFit: 'contain' }}
                />
              </Avatar>
              <Box>
                <Typography variant='subtitle2' sx={{ fontWeight: 600, lineHeight: 1.2 }}>
                  EasyCom Assistant
                </Typography>
                <Typography variant='caption' sx={{ opacity: 0.9, fontSize: '0.7rem' }}>
                  {isLoading ? 'Typing...' : 'Online'}
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <IconButton onClick={handleMinimize} size='small' sx={{ color: 'inherit', mr: 0.5 }}>
                <RemoveIcon fontSize='small' />
              </IconButton>
              <IconButton onClick={handleReset} size='small' sx={{ color: 'inherit', mr: 0.5 }}>
                <RefreshIcon fontSize='small' />
              </IconButton>
              <IconButton onClick={() => setOpen(false)} size='small' sx={{ color: 'inherit' }}>
                <CloseIcon fontSize='small' />
              </IconButton>
            </Box>
          </ChatHeader>

          <Collapse in={!minimized} timeout={200}>
            <Box sx={{ height: 400, display: 'flex', flexDirection: 'column' }}>
              <MessagesContainer>
                {messages.map(message => (
                  <Fade key={message.id} in timeout={300}>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'flex-end',
                        gap: 0.5,
                        flexDirection: message.isUser ? 'row-reverse' : 'row',
                        mb: 0.5
                      }}
                    >
                      {!message.isUser && (
                        <Avatar sx={{ width: 24, height: 24, bgcolor: '#fff' }}>
                          <img
                            src='/images/chatbot/chatbot.png'
                            alt='Chatbot'
                            style={{ width: 20, height: 20, objectFit: 'contain' }}
                          />
                        </Avatar>
                      )}
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
                        <MessageBubble isUser={message.isUser}>
                          <Typography variant='body2' sx={{ fontSize: '0.875rem' }}>
                            {message.text}
                          </Typography>
                        </MessageBubble>
                        <Typography
                          variant='caption'
                          sx={{
                            color: 'text.secondary',
                            alignSelf: message.isUser ? 'flex-end' : 'flex-start',
                            fontSize: '0.65rem',
                            px: 0.5
                          }}
                        >
                          {formatTime(message.timestamp)}
                        </Typography>
                      </Box>
                    </Box>
                  </Fade>
                ))}

                {isLoading && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Avatar sx={{ width: 24, height: 24, bgcolor: '#fff' }}>
                      <img
                        src='/images/chatbot/chatbot.png'
                        alt='Chatbot'
                        style={{ width: 20, height: 20, objectFit: 'contain' }}
                      />
                    </Avatar>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CircularProgress size={12} />
                      <Typography variant='caption' color='text.secondary'>
                        Typing...
                      </Typography>
                    </Box>
                  </Box>
                )}

                {messages.length === 1 && (
                  <Box sx={{ mt: 1 }}>
                    <Typography variant='caption' color='text.secondary' sx={{ px: 1, mb: 1, display: 'block' }}>
                      Quick questions:
                    </Typography>
                    <QuickReplies>
                      {quickQuestions.map((question, index) => (
                        <Chip
                          key={index}
                          label={question}
                          size='small'
                          onClick={() => handleQuickQuestion(question)}
                          sx={{
                            fontSize: '0.7rem',
                            height: 24,
                            cursor: 'pointer',
                            background: 'linear-gradient(90deg, #d86db0 0%, #b35bb5 100%)',
                            color: '#fff',
                            '&:hover': {
                              background: 'linear-gradient(90deg, #bb4edc 0%, #8156b7 100%)',
                              color: '#fff'
                            }
                          }}
                        />
                      ))}
                    </QuickReplies>
                  </Box>
                )}
                <div ref={messagesEndRef} />
              </MessagesContainer>

              <Divider />
              <Box component='form' onSubmit={handleSubmit}>
                <InputContainer>
                  <TextField
                    ref={inputRef}
                    fullWidth
                    variant='outlined'
                    placeholder='Type your message...'
                    value={inputValue}
                    onChange={e => setInputValue(e.target.value)}
                    disabled={isLoading}
                    size='small'
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 3,
                        fontSize: '0.875rem'
                      }
                    }}
                  />
                  <IconButton
                    type='submit'
                    disabled={!inputValue.trim() || isLoading}
                    sx={{
                      background: 'linear-gradient(135deg, #bb4edc 0%, #d86db0 100%)',
                      color: '#fff',
                      width: 36,
                      height: 36,
                      '&:hover': {
                        background: 'linear-gradient(135deg, #d86db0 0%, #b35bb5 100%)'
                      },
                      '&:disabled': {
                        backgroundColor: '#8e839b',
                        color: '#eee'
                      }
                    }}
                  >
                    <SendIcon fontSize='small' />
                  </IconButton>
                </InputContainer>
              </Box>
            </Box>
          </Collapse>
        </ChatWindow>
      </Zoom>

      <Box sx={{ position: 'relative' }}>
        <StyledFab size='medium' onClick={handleToggleChat} isOpen={open}>
          {open ? (
            <CloseIcon />
          ) : (
            <img
              src='/images/chatbot/chatbot.png'
              alt='Chatbot'
              style={{ width: 28, height: 28, objectFit: 'contain' }}
            />
          )}
        </StyledFab>
        {unreadCount > 0 && !open && <NotificationBadge>{unreadCount > 9 ? '9+' : unreadCount}</NotificationBadge>}
      </Box>
    </FloatingContainer>
  )
}

export default ChatbotWidget
