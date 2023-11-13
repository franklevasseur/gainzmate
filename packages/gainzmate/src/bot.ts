import { z } from 'zod'
import * as bp from '.botpress'
import * as dallox from 'dallox'
import { stateRepo } from './state'

export type Bot = typeof bot
export type MessageHandler = Parameters<Bot['message']>[0]
export type MessageHandlerProps = Parameters<MessageHandler>[0]
export type Flow = typeof flow
export type FlowNode<TInput extends z.AnyZodObject> = ReturnType<typeof flow.declareNode<TInput>>

export const bot = new bp.Bot({
  integrations: {
    telegram: new bp.telegram.Telegram({
      enabled: true,
      config: {
        botToken: '6402478878:AAE-zzePKjgIl23G4VoP_S1StPaf4JoBzHU',
      },
    }),
    gsheets: new bp.gsheets.Gsheets({
      enabled: true,
      config: {
        spreadsheetId: '1d5Vgaixn8-QrBJmqUZifXWFB53bUWKlKAOerw6Y08A8',
        privateKey:
          '-----BEGIN PRIVATE KEY-----MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDArCIEYGzFAyJP8fglywuUgg2sE41jCYeN80/hxR2HrC/QrVg33Z2ItSeXU64n5+CKMjQEZUS1zMVrTdHVsmlW+PZsEN4Fs90e40Yfk6fT7ODAeOn7zf7yq5OaMl3M/GXZ4g5UVfm2nJIzDudOTNKwP4z3pmHJekndgtsvzQ7IkFudC63OyIki6geMP39B34sKory4rKZAk5UR4rIvLQBFzkdCR/c6EKvI3qPi2bB4QtAkbeIFKeNnqiMJzKIIeK76bkeAtZWJ4dUZUCd47P6vymiQlEp/S3/Eyn2PMadlZfdHeCiaUqbLhn0CTmRlGqEQEoCNG7C6VtJeZMhHWnypAgMBAAECggEAD1xp5eFuKpLiZG9NMm4qwS9RObvhVNkIpqeUYdKeVRfERCXd165iheizfFwekW3qN/pirUsJnFj0EGcG6LutrFJzCxCZMukxIupJx/C0u6+yB4ZcWUgGIIDPZsbHNbWVxTZBoDWukAGRomJ4zIRRc93NNl1chHyscO2i3f/CQvkj2LUt8OslbHFfS2uAvxmUqvKWimTG0qAwTF68cOobxwmf6fEM+IHd+0yWVCGRSPGUX5pLO0s6vCTM4lIYJzRHJ9QC/LavB7GslSmZj2OYZhtL2R/WsIVumi5QZo7ko/cAjJaA+D5P+ss2jrzMwKFhut+A+kpst5ZALHTbB/6mEQKBgQDyPK7JYWr0n1FiUBY36QqPHWEsIzwdFA38GrYZFeuyhy5KTVNUdt9dj64Gyn1LR+7/h9xNk3lJi2L0QSmgUkLinqKtxWRKoIqpHeGKopDOj6kWJjdFASUjP5LviBWtGJL15Bm/FtiXfeEZHOL/XyLBNzdLtnB9963BFFYSpjFHPQKBgQDLnolZIQbXgrlvpPjQdH+MPaUM1iWQA3ab1DCf+aBSDI5/y5r6lWPYPBoLi08MVd1HqTnJ3nxSW7A6JQrziZp3P6nzKVPzb7+2yymwocfXQ0ZQxyz3XVEtW2ETAc2sdCLLHx2pg4MQYEE6DoJM5YbfsAgkb2qGMtxtHuQoYjfB3QKBgQCInlTt2vWZlakuy4BcdCCyap19aTnkJIVmpCIDr+tIuxkOauIOhySe/gPmbJmRtbZDg/pp/jyvj991ZrL1aq+yZEnXu7Y+qKDLlMC5kcod1cRFa7RMRMMPSDG0yol/IJbx+33R2i658hLcOQCFisBtPJkBKJn1UZU7ih6pUfYE+QKBgC7aQ/BmURS118WAyF/u7opuhNP3Up1YrqocoTOuVN2MVh3B099lEJxo9/VAEOhduZULs2hn8WNiBaLbczGmsAxQceKp189kH1EIXoduMnWt3TgpHIeuyUcOh7+/4nuUHY1vk3u17yqNe3TIceMPzYEbGESJ/pDykxXozccdEodhAoGBAMjsssyeXM2TCYV6fes1X3MqeMbKcFZHvuun2ASmKdPkdU4xKz6Nrl8XCrG/8PB9NPkN/rK3HYr8uPvSSCqLt4BVKA1whgyBwvos6m1NJDnICz9M74Utu56IczF4/X4ez4lzChgLXnpl3ke6LMmTBIlvGItdpVONwRXduIHMJHsS-----END PRIVATE KEY-----',
        clientEmail: 'fleur-tmp-3@fleur-tmp.iam.gserviceaccount.com',
      },
    }),
  },
  states: {
    flow: {
      type: 'conversation',
      schema: z.object({
        next: z.string(),
        data: z.object({}).passthrough(),
      }),
    },
  },
})

export const flow = dallox.createFlow(bot, stateRepo)
