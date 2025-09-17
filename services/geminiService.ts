import { GoogleGenAI, Type } from "@google/genai";
import type { SportComplex, Review, User, AISuggestion } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const sportsComplexSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      id: { type: Type.INTEGER, description: "شناسه منحصر به فرد برای مجموعه" },
      name: { type: Type.STRING, description: "نام مجموعه ورزشی" },
      address: { type: Type.STRING, description: "آدرس کامل مجموعه در تبریز" },
      sports: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "لیست ورزش‌های موجود مانند فوتسال، والیبال و غیره.",
      },
      description: { type: Type.STRING, description: "توضیحی کوتاه و جذاب درباره امکانات" },
      imageUrl: { type: Type.STRING, description: "یک URL تصویر جایگزین از https://picsum.photos" },
      rating: { type: Type.NUMBER, description: "امتیازی بین 4.0 تا 5.0" },
      availableTimeSlots: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            time: { type: Type.STRING, description: "بازه زمانی، مثلا '14:00 - 15:00'" },
            isBooked: { type: Type.BOOLEAN, description: "اینکه آیا این زمان قبلا رزرو شده است" },
          },
        },
        description: "لیست بازه‌های زمانی موجود برای یک روز معین"
      },
    },
  },
};

export const fetchSportsComplexes = async (): Promise<SportComplex[]> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: "یک لیست شامل ۸ مجموعه ورزشی تخیلی اما با اسامی واقع‌گرایانه در شهر تبریز، ایران ایجاد کن. برای هر مجموعه، یک شناسه منحصر به فرد، نام، آدرس، لیستی از ۳-۴ ورزش ارائه‌شده، توضیحی کوتاه، یک URL تصویر تصادفی از picsum.photos با اندازه 600x400، امتیازی بین ۴.۲ و ۴.۹، و ۸ بازه زمانی موجود برای امروز که حدود ۳ تای آنها به عنوان رزرو شده علامت‌گذاری شده باشند، ارائه بده.",
      config: {
        responseMimeType: "application/json",
        responseSchema: sportsComplexSchema,
      },
    });

    const jsonText = response.text.trim();
    const data = JSON.parse(jsonText);
    return data as SportComplex[];

  } catch (error) {
    console.error("Error fetching sports complexes:", error);
    // In case of an error, return an empty array or handle it as needed.
    return [];
  }
};


export const generateTeamBuildingPost = async (sport: string, time: string, message: string): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `شما یک مدیر جامعه ورزشی دوستانه و پرشور هستید. یک کاربر می‌خواهد برای فعالیتی در تبریز هم‌تیمی پیدا کند. یک پست anunciamento جذاب و دعوت‌کننده برای او ایجاد کنید.
            
            جزئیات به شرح زیر است:
            - ورزش: ${sport}
            - زمان: ${time}
            - پیام کاربر: "${message}"

            پست باید دوستانه، واضح و تشویق‌کننده برای پیوستن باشد. آن را به گونه‌ای بنویسید که به راحتی بتوان آن را کپی و در شبکه‌های اجتماعی به اشتراک گذاشت. با یک عنوان جذاب شروع کنید.`,
        });
        return response.text;
    } catch (error) {
        console.error("Error generating team building post:", error);
        return "متاسفانه، در حال حاضر نتوانستیم پستی ایجاد کنیم. لطفاً بعداً دوباره امتحان کنید.";
    }
};

export const summarizeReviews = async (reviews: Review[]): Promise<string> => {
    try {
        if (reviews.length === 0) {
            return "هیچ نظری برای خلاصه‌سازی وجود ندارد.";
        }

        const reviewContent = reviews.map(r => `- امتیاز: ${r.rating}/5\n- نظر: "${r.comment}"`).join('\n\n');

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `به عنوان یک دستیار مفید، نظرات کاربران زیر را برای یک مجموعه ورزشی تحلیل کن. خلاصه‌ای متعادل و مختصر ارائه بده که نکات مثبت اصلی (مزایا) و نکات منفی اصلی (معایب) را برجسته کند. اطلاعاتی را از خودت اضافه نکن. خلاصه‌ات را تنها بر اساس نظرات ارائه‌شده بنویس.

            نظرات به شرح زیر است:
            ${reviewContent}
            
            لطفاً خروجی خود را با بخش‌های "مزایا:" و "معایب:" ساختاربندی کن. اگر معایب یا مزایای واضحی وجود نداشت، این موضوع را ذکر کن.`,
        });

        return response.text;
    } catch (error) {
        console.error("Error summarizing reviews:", error);
        throw new Error("خلاصه‌سازی نظرات با شکست مواجه شد.");
    }
};

const suggestionSchema = {
    type: Type.ARRAY,
    items: {
        type: Type.OBJECT,
        properties: {
            name: { type: Type.STRING, description: "نام مجموعه پیشنهادی." },
            reason: { type: Type.STRING, description: "یک دلیل کوتاه و شخصی‌سازی‌شده برای پیشنهاد." }
        },
    }
};


export const getAIComplexSuggestions = async (user: User, complexes: SportComplex[]): Promise<AISuggestion[]> => {
    try {
        if (!complexes || complexes.length === 0) return [];
        
        const complexNames = complexes.map(c => c.name).join(', ');
        
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `شما یک دستیار پیشنهاد مجموعه ورزشی برای اسپورت‌زون تبریز هستید.
            کاربری با شناسه "${user.emailOrPhone}" پیشنهادهای شخصی‌سازی‌شده می‌خواهد.
            بر اساس پروفایل او (می‌توانید ترجیحات را استنباط کنید)، ۳ مجموعه برتر را از لیست زیر به او پیشنهاد دهید.
            برای هر پیشنهاد یک دلیل کوتاه، دوستانه و شخصی‌سازی‌شده ارائه دهید.

            مجموعه‌های موجود: ${complexNames}

            پاسخ را به صورت یک آرایه JSON از اشیاء برگردانید که هر شیء دارای کلیدهای 'name' و 'reason' باشد.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: suggestionSchema,
            },
        });

        const jsonText = response.text.trim();
        const data = JSON.parse(jsonText);
        return data as AISuggestion[];

    } catch (error) {
        console.error("Error getting AI suggestions:", error);
        throw new Error("ایجاد پیشنهادهای هوش مصنوعی با شکست مواجه شد.");
    }
};