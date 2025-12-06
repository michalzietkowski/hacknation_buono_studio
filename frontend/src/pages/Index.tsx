import { FormProvider } from '@/context/FormContext';
import { AIChatProvider } from '@/context/AIChatContext';
import { FormWizard } from '@/components/zant/FormWizard';
import { AIAssistantChat } from '@/components/zant/AIAssistantChat';
import { AIFloatingButton } from '@/components/zant/AIFloatingButton';
import { Helmet } from 'react-helmet';

const Index = () => {
  return (
    <FormProvider>
      <AIChatProvider>
        <Helmet>
          <title>ZANT - Asystent zgłoszenia wypadku przy pracy | ZUS</title>
          <meta
            name="description"
            content="ZANT (ZUS Accident Notification Tool) - narzędzie pomagające krok po kroku przygotować dokumenty do zgłoszenia wypadku przy pracy do ZUS."
          />
        </Helmet>
        <FormWizard />
        <AIFloatingButton />
        <AIAssistantChat />
      </AIChatProvider>
    </FormProvider>
  );
};

export default Index;
