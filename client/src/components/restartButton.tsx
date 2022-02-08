import './restartButton.scss';
import React from 'react';
import Modal from 'react-modal';
import Base from './base';
import Button from './button';
import RestartSvg from '../art/restartSvg';

interface RestartButtonProps {
    restartApi: any;
    name: string;
    namespace: string;
}

interface RestartButtonStates {
    restartInfo: any;
}

export default class RestartButton extends Base<RestartButtonProps, RestartButtonStates> {
    render() {
        const {restartInfo = null} = this.state || {};

        return (
            <>
                <Button title='Restart' className='button_headerAction' onClick={() => this.openModal()}>
                    <RestartSvg />
                    <span className='button_label'>Restart</span>
                </Button>

                {restartInfo && (
                    <Modal isOpen={true} className='modal_modal' overlayClassName='modal_overlay' onRequestClose={() => this.close()}>
                        <div className='restartButton'>
                            <div className='restartButton_label'>Confirm Rolling Restart</div>
                            <div className='modal_actions'>
                                <Button className='button' onClick={() => this.restart()}>Restart</Button>
                                <Button className='button_negative' onClick={() => this.close()}>Cancel</Button>
                            </div>
                        </div>
                    </Modal>
                )}
            </>
        );
    }

    async openModal() {
        const {namespace, name, restartApi} = this.props;
        const restartInfo = await restartApi.get(namespace, name);
        this.setState({restartInfo});
    }

    async restart() {
        const {namespace, name, restartApi} = this.props;
        const {restartInfo = null} = this.state || {};
        if (restartInfo == null) return;
        const now = new Date();
        const restartBody = {
            spec: {
                template: {
                    metadata: {
                        annotations: {
                            'kubectl.kubernetes.io/restartedAt': now.toString()
                        }
                    }
                }
            }
        };
        
        await restartApi.patch(namespace, name, restartBody);

        this.close();
    }

    close() {
        // Use setTimeout to prevent the following React warning:
        // "Warning: Can't perform a React state update on an unmounted component."
        setTimeout(() => this.setState({restartInfo: null}), 0);
    }
}
