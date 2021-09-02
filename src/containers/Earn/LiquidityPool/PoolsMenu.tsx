import { Plus } from 'react-feather'
import styled from 'styled-components'
import Button from '../../../components/Button'
import { useStoreActions } from '../../../store'

const PoolsMenu = () => {
    const { popupsModel: popupsActions } = useStoreActions((state) => state)
    return (
        <BtnContainer>
            <Button onClick={() => popupsActions.setIsPositionsModalOpen(true)}>
                <BtnInner>
                    <Plus size={18} /> New Position
                </BtnInner>
            </Button>
        </BtnContainer>
    )
}

export default PoolsMenu

const BtnInner = styled.div`
    display: flex;
    align-items: center;
`

const BtnContainer = styled.div`
    position: relative;
`
