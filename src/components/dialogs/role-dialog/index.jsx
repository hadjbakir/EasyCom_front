'use client'

// React Imports
import { useState, useEffect } from 'react'

// MUI Imports
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import Typography from '@mui/material/Typography'
import Checkbox from '@mui/material/Checkbox'
import FormGroup from '@mui/material/FormGroup'
import FormControlLabel from '@mui/material/FormControlLabel'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'

// Component Imports
import DialogCloseButton from '../DialogCloseButton'
import CustomTextField from '@core/components/mui/TextField'

// Style Imports
import tableStyles from '@core/styles/table.module.css'

const defaultData = [
  'Store owner',
  'import-export',
  'materials-premier',

]

const RoleDialog = ({ open, setOpen, title }) => {
  // States
  const [selectedCheckbox, setSelectedCheckbox] = useState(
    title
      ? [
          'user-management-read',
          'user-management-write',
          'user-management-create',
          'disputes-management-read',
          'disputes-management-write',
          'disputes-management-create'
        ]
      : []
  )

  const [isIndeterminateCheckbox, setIsIndeterminateCheckbox] = useState(false)

  const handleClose = () => {
    setOpen(false)
  }

  const togglePermission = id => {
    const arr = selectedCheckbox

    if (selectedCheckbox.includes(id)) {
      arr.splice(arr.indexOf(id), 1)
      setSelectedCheckbox([...arr])
    } else {
      arr.push(id)
      setSelectedCheckbox([...arr])
    }
  }

  const handleSelectAllCheckbox = () => {
    if (isIndeterminateCheckbox) {
      setSelectedCheckbox([])
    } else {
      defaultData.forEach(row => {
        const id = (typeof row === 'string' ? row : row.title).toLowerCase().split(' ').join('-')

        togglePermission(`${id}-check`)

      })
    }
  }

  useEffect(() => {
    if (selectedCheckbox.length > 0 && selectedCheckbox.length < defaultData.length * 3) {
      setIsIndeterminateCheckbox(true)
    } else {
      setIsIndeterminateCheckbox(false)
    }
  }, [selectedCheckbox])

  return (
    <Dialog
      fullWidth
      maxWidth='md'
      scroll='body'
      open={open}
      onClose={handleClose}
      closeAfterTransition={false}
      sx={{ '& .MuiDialog-paper': { overflow: 'visible' } }}
    >
      <DialogCloseButton onClick={() => setOpen(false)} disableRipple>
        <i className='tabler-x' />
      </DialogCloseButton>
      <DialogTitle variant='h4' className='flex flex-col gap-2 text-center sm:pbs-16 sm:pbe-6 sm:pli-16'>
        {title ? 'Edit Role' : 'Add Role'}
        <Typography component='span' className='flex flex-col text-center'>
          Set Role Permissions
        </Typography>
      </DialogTitle>
      <form onSubmit={e => e.preventDefault()}>
        <DialogContent className='overflow-visible flex flex-col gap-6 pbs-0 sm:pli-16'>
          <CustomTextField
            label='Role Name'
            variant='outlined'
            fullWidth
            placeholder='Enter Role Name'
            defaultValue={title}
            onChange={e => e.target.value}
          />
          <Typography variant='h5' className='min-is-[225px]'>
            Role Permissions
          </Typography>
          <div className='overflow-x-auto'>
            <table className={tableStyles.table}>
              <tbody>
                <tr className='border-bs-0'>
                  <th className='pis-0'>
                    <Typography color='text.primary' className='font-medium whitespace-nowrap flex-grow min-is-[225px]'>
                      Administrator Access
                    </Typography>
                  </th>
                  <th className='!text-end pie-0'>
                    <FormControlLabel
                      className='mie-0 capitalize'
                      control={
                        <Checkbox
                          onChange={handleSelectAllCheckbox}
                          indeterminate={isIndeterminateCheckbox}
                          checked={selectedCheckbox.length === defaultData.length * 3}
                        />
                      }
                      label='Select All'
                    />
                  </th>
                </tr>
                {defaultData.map((item, index) => {
                  const id = (typeof item === 'string' ? item : item.title).toLowerCase().split(' ').join('-')

                  return (
                    <tr key={index} className='border-be'>
                      <td className='pis-0'>
                        <Typography
                          className='font-medium whitespace-nowrap flex-grow min-is-[225px]'
                          color='text.primary'
                        >
                          {typeof item === 'object' ? item.title : item}
                        </Typography>
                      </td>
                      <td className='!text-end pie-0'>
                        {typeof item === 'object' ? (
                          <FormGroup className='flex-row justify-end flex-nowrap gap-6'>
                            <FormControlLabel
                              className='mie-0'
                              control={<Checkbox checked={item.check} />}
                              label='Check'
                            />

                          </FormGroup>
                        ) : (
                          <FormGroup className='flex-row justify-end flex-nowrap gap-6'>
                            <FormControlLabel
                              className='mie-0'
                              control={
                                <Checkbox
                                  id={`${id}-check`}
                                  onChange={() => togglePermission(`${id}-check`)}
                                  checked={selectedCheckbox.includes(`${id}-check`)}
                                />
                              }
                              label='check'
                            />


                          </FormGroup>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </DialogContent>
        <DialogActions className='justify-center pbs-0 sm:pbe-16 sm:pli-16'>
          <Button variant='contained' type='submit' onClick={handleClose}>
            Submit
          </Button>
          <Button variant='tonal' type='reset' color='secondary' onClick={handleClose}>
            Cancel
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

export default RoleDialog
